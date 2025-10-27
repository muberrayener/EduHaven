import UserList from "../components/chats/userlist";
import ChatWindow from "../components/chats/chatwindow";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useState, useEffect } from "react";
import { useFriends } from "@/queries/friendQueries";
import UseSocketContext from "../contexts/SocketContext";

function Chats() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  // State to temporarily hold unread counts that arrive before the friends list
  const [pendingUnreadCounts, setPendingUnreadCounts] = useState({});
  const { data: friends = [] } = useFriends();

  useEffect(() => {
    if (!friends || friends.length === 0) return;
    const mapped = friends.map((f) => {
      const id = f.id ?? (f._id && (f._id.$oid || f._id)) ?? null;
      const name = f.FirstName ? `${f.FirstName} ${f.LastName || ""}`.trim() : f.name || f.Username || f.Email || "New User";
      return {
        id,
        _id: f._id,
        name,
        avatar: f.ProfilePicture || null,
        lastMessage: "",
        timestamp: "",
        isOnline: f.isOnline ?? false,
        // Apply any pending counts that have already arrived
        unreadCount: pendingUnreadCounts[id] || 0,
      };
    });
    setUsers(mapped);
    // Clear pending counts once they are applied
    setPendingUnreadCounts({});
  }, [friends]); // Note: pendingUnreadCounts is not a dependency here to avoid re-renders.

  const { socket, user: currentUser } = UseSocketContext();

  // Handle online users updates
  useEffect(() => {
    if (!socket) return;

    const handleOnlineUsers = (onlineUsers) => {
      setUsers((prev) => prev.map(user => {
        const isOnline = onlineUsers.some(online => 
          online.id === user.id || online.id === user._id || (user._id && user._id.$oid === online.id)
        );
        return { ...user, isOnline };
      }));
    };

    socket.on("online_users_updated", handleOnlineUsers);
    return () => socket.off("online_users_updated", handleOnlineUsers);
  }, [socket]);

  // Listen for incoming messages globally and update unread counts when the
  // conversation is not currently open.
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      try {
        if (!data) return;
        // ignore messages sent by current user
        if (currentUser && data.userId === currentUser.id) return;

        const senderId = data.userId;
        const messageText = data.message || data.text || "";
        const ts = data.timestamp ? new Date(data.timestamp) : new Date();
        const timestamp = ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        
        setUsers((prev) => {
          const idx = prev.findIndex(
            (u) => u.id === senderId || u._id === senderId || (u._id && u._id.$oid === senderId)
          );
          
          if (idx > -1) {
            const updated = [...prev];
            updated[idx] = {
              ...updated[idx],
              lastMessage: messageText,
              timestamp,
            };
            const [item] = updated.splice(idx, 1);
            return [item, ...updated];
          }

          // If sender not in list, add to top
          const newEntry = {
            id: senderId,
            _id: senderId,
            name: data.username || "New User",
            avatar: data.profileImage || null,
            lastMessage: messageText,
            timestamp,
            isOnline: false,
            unreadCount: 1,
          };

          return [newEntry, ...prev];
        });
      } catch (e) {
        console.error("Error handling new_message in Chats.jsx", e);
      }
    };

    socket.on("new_message", handleNewMessage);
    return () => socket.off("new_message", handleNewMessage);
  }, [socket, currentUser, selectedUser]);

  // Listen for unread count updates from the server
  useEffect(() => {
    if (!socket) return;

    const handleUnreadUpdate = ({ senderId, unreadCount }) => {
      setUsers((prevUsers) => {
        // If the user list is already populated, update it directly.
        if (prevUsers.length > 0) {
          return prevUsers.map((user) =>
            user.id === senderId || user._id === senderId || (user._id && user._id.$oid === senderId)
              ? { ...user, unreadCount }
              : user
          );
        }
        // If the user list is not yet populated, store the count as pending.
        setPendingUnreadCounts((prevCounts) => ({
          ...prevCounts,
          [senderId]: unreadCount,
        }));
        return prevUsers; // Return the empty array for now
      });
    };

    socket.on("unread_count_updated", handleUnreadUpdate);
    return () => socket.off("unread_count_updated", handleUnreadUpdate);
  }, [socket]);

  // When the component mounts or socket becomes available, ask the server for all current unread counts.
  // This ensures counts are correct even when navigating back to this page.
  useEffect(() => {
    if (socket && currentUser) {
      socket.emit("request_initial_unread_counts");
    }
  }, [socket, currentUser]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    // Reset count locally for immediate UI feedback
    const userId = user.id ?? user._id;
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, unreadCount: 0 } : u)));

    // Notify server to reset the count
    if (socket && currentUser) {
      socket.emit("mark_as_read", {
        senderId: userId, // The user whose chat is being read
        recipientId: currentUser.id, // The current user who is reading the chat
      });
    }
  };

  return (
    <div
      className="flex h-screen"
      style={{
        backgroundColor: "color-mix(in srgb, var(--bg-primary), black 15%)",
      }}
    >
      <PanelGroup autoSaveId="chat-panel" direction="horizontal">
        {/* Sidebar */}
        <Panel minSize={15} defaultSize={25} maxSize={40}>
          <UserList users={users} selectedUser={selectedUser} onSelectUser={handleSelectUser} />
        </Panel>

        {/* Draggable Resizer */}
        <PanelResizeHandle className="w-1 bg-gray-600 hover:bg-gray-400 cursor-col-resize transition-colors" />

        {/* Chat Window */}
        <Panel minSize={40}>
          <ChatWindow selectedUser={selectedUser} />
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default Chats;
