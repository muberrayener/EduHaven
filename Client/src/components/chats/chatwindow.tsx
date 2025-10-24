import React, { useState, useRef, useEffect } from "react";
import { Send, MoreVertical, Smile, User, Users, Dot } from "lucide-react";
import EmojiPicker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import UseSocketContext from "../../contexts/SocketContext"; // adjust path if needed

const ChatWindow: React.FC<{ selectedUser: any }> = ({ selectedUser }) => {
  const { socket, isConnected, onlineUsers, user } = UseSocketContext();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [messagesByRoom, setMessagesByRoom] = useState({});
  const [onlineFriends, setOnlineFriends] = useState([]);

  const [showEmoji, setShowEmoji] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const textareaRef = useRef(null);

  function getRoomId(user1, user2) {
    // Extract the actual ID values, handling different formats
    const getId = (user) => {
      if (!user) return null;
      if (typeof user === 'string') return user;
      return user.$oid || user.id || user._id || user;
    };

    const id1 = getId(user1);
    const id2 = getId(user2);

    console.log('Creating room ID from:', { id1, id2 });
    if (!id1 || !id2) {
      console.warn('Missing user ID when creating room ID');
      return null;
    }

    return [id1, id2].sort().join('_');
  }

  // Handle room joining and online status
  useEffect(() => {
    if (!socket || !selectedUser || !user) {
      console.log('Missing required data for joining room:', { socket: !!socket, selectedUser, user });
      return;
    }

    const roomId = getRoomId(user.id, selectedUser.id);
    if (!roomId) {
      console.warn('Failed to generate valid room ID');
      return;
    }

    console.log('Joining room:', roomId);
    socket.emit("join_room", { roomId });

    // Request message history and online friends
    socket.emit("get_messages", { roomId });
    socket.emit("get_online_friends");

    // Listen for online status updates
    const handleOnlineList = (users) => {
      console.log('Received online users:', users);
      setOnlineFriends(users);
    };

    socket.on("online_users_updated", handleOnlineList);
    socket.on("online_friends_list", handleOnlineList);

    return () => {
      socket.off("online_users_updated", handleOnlineList);
      socket.off("online_friends_list", handleOnlineList);
    };
  }, [socket, selectedUser, user]);

  // Load messages when selecting a user
  useEffect(() => {
    if (!selectedUser || !user) {
      console.log('No user selected or current user missing');
      return;
    }
    console.log('Loading messages for user:', selectedUser);
    console.log('Current user:', user);
    
    const roomId = getRoomId(user.id, selectedUser.id);
    console.log('Generated roomId:', roomId);
    console.log('Available messagesByRoom:', messagesByRoom);
    
    const existingMessages = messagesByRoom[roomId] || [];
    console.log('Found messages for room:', existingMessages);
    
    setMessages(existingMessages);
  }, [selectedUser, user, messagesByRoom]);

  // Receive real-time messages
  useEffect(() => {
    if (!socket || !selectedUser || !user) return;

    const roomId = getRoomId(user.id, selectedUser.id);

    const handleReceiveMessage = (data) => {
      console.log('Received message:', data);
      console.log('Current roomId:', roomId);
      console.log('Current user:', user?.id);
      console.log('Selected user:', selectedUser?.id);

      if (!data.roomId || !data.message) {
        console.warn('Missing required message data:', data);
        return;
      }

      if (data.userId === user?.id) {
      // 🔥 Ignore messages you sent yourself (already added locally)
      return;
      }

      const newMessage = {
        id: data.id || Date.now(),
        text: data.message || data.text,
        sender: data.userId === user?.id ? "me" : "other",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      // Log the current state before update
      console.log('Current messagesByRoom:', messagesByRoom);
      console.log('Current messages:', messages);

      // Store in room-specific storage
      setMessagesByRoom(prev => {
        const updated = {
          ...prev,
          [data.roomId]: [...(prev[data.roomId] || []), newMessage]
        };
        console.log('Updated messagesByRoom:', updated);
        return updated;
      });

      // Update current messages if in the same room
      if (data.roomId === roomId) {
        console.log('Updating current room messages');
        setMessages(prev => [...prev, newMessage]);
      } else {
        console.log('Message for different room. Expected:', roomId, 'Got:', data.roomId);
      }
    };

    socket.on("new_message", handleReceiveMessage);

    // Request message history
    socket.emit("get_messages", { roomId });

    return () => {
      socket.off("new_message", handleReceiveMessage);
    };
  }, [socket, selectedUser, user]);


  // Emit typing event when message is being typed
  useEffect(() => {
  if (!socket || !selectedUser) return;

  const roomId = getRoomId(user.id, selectedUser.id);
  if (message.trim() === "") {
    socket.emit("typing_stop", { roomId });
    return;
  }

  socket.emit("typing_start", { roomId });

  const timeoutId = setTimeout(() => {
    socket.emit("typing_stop", { roomId });
  }, 2000);

  return () => clearTimeout(timeoutId);
}, [message, socket, selectedUser, user]);


  // Listen for typing indicator and message history
  useEffect(() => {
    if (!socket || !selectedUser) return;

    const handleTyping = (data) => {
      if (data.userId === selectedUser.id) {
        setIsTyping(data.isTyping);
      }
    };

    const handleMessageHistory = (data) => {
      if (!data || !data.roomId) return;

      const formattedMessages = data.messages.map(msg => ({
        id: msg.id,
        text: msg.message || msg.text,
        sender: msg.userId === user?.id ? "me" : "other",
        timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

      setMessagesByRoom(prev => ({
        ...prev,
        [data.roomId]: formattedMessages
      }));

      // If this is for the current room, update messages
      if (data.roomId === getRoomId(user?.id, selectedUser.id)) {
        setMessages(formattedMessages);
      }
    };

    socket.on("user_typing", handleTyping);
    socket.on("messages_history", handleMessageHistory);
    
    return () => {
      socket.off("user_typing", handleTyping);
      socket.off("messages_history", handleMessageHistory);
    };
  }, [socket, selectedUser, user]);


  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close emoji picker on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target)
      ) {
        setShowEmoji(false);
      }
    };

    if (showEmoji) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmoji]);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedUser || !socket || !user) return;

    const roomId = getRoomId(user.id, selectedUser.id);

    const newMessage = {
      id: Date.now(),
      text: message.trim(),
      sender: "me",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Store the message locally immediately for instant feedback
    setMessagesByRoom(prev => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), newMessage]
    }));
    setMessages(prev => [...prev, newMessage]);

    // Send to server
    socket.emit("send_message", {
      roomId,
      message: message.trim(),
      messageType: "text",
    });

    setMessage("");
    setCursorPosition(0);
  };


  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleEmojiPicker = () => {
    setShowEmoji(!showEmoji);
  };

  const onEmojiSelect = (emoji) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const position = textarea.selectionStart || cursorPosition;
      const newMessage =
        message.slice(0, position) + emoji.native + message.slice(position);

      setMessage(newMessage);
      setShowEmoji(false);

      textarea.focus();
      const newCursorPosition = position + emoji.native.length;
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
      setCursorPosition(newCursorPosition);
    }
  };

  const handleTextareaClick = () => {
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart);
    }
  };

  const handleTextareaKeyUp = () => {
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart);
    }
  };

  if (!selectedUser) {
    return (
      <div
        className="h-full flex items-center justify-center"
        style={{
          backgroundColor: "color-mix(in srgb, var(--bg-ter), black 15%)",
        }}
      >
        <div className="text-center txt-disabled">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
          <p>Choose from your existing conversations or start a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col"
      style={{
        backgroundColor: "color-mix(in srgb, var(--bg-ter), black 15%)",
      }}
    >
      {/* Chat Header - Responsive */}
      <div
        className="p-2 sm:p-3 lg:p-4 border-b border-gray-200/20"
        style={{
          backgroundColor: "color-mix(in srgb, var(--bg-sec), black 10%)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Avatar - Responsive sizing */}
            {selectedUser.avatar ? (
              <img
                src={selectedUser.avatar}
                alt={selectedUser.name}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center">
                {selectedUser.isGroup ? (
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 txt-dim" />
                ) : (
                  <User className="w-4 h-4 sm:w-5 sm:h-5 txt-dim" />
                )}
              </div>
            )}

            {/* User Info - Responsive text sizing */}
            <div>
              <h3 className="font-semibold txt text-sm sm:text-base">
                {selectedUser.name}
              </h3>
              <p className="text-xs sm:text-sm txt-dim">
                {selectedUser.isGroup ? (
                  `${Math.floor(Math.random() * 20) + 5} members`
                ) : (
                  onlineFriends.some(u => 
                    u.id === selectedUser.id || 
                    u.id === selectedUser._id || 
                    (selectedUser._id && selectedUser._id.$oid === u.id)
                  ) ? (
                    <span className="text-green-500">Online</span>
                  ) : (
                    "Last seen recently"
                  )
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons - Responsive sizing */}
          <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => {
                  const isOnline = onlineFriends.some(u => u.id === user?.id);
                  socket?.emit("set_online_status", isOnline ? "offline" : "online");
                }}
                className="p-1.5 sm:p-2 rounded-full hover:opacity-70 transition-colors txt-dim hover:txt"
                title={onlineFriends.some(u => u.id === user?.id) ? "Set Offline" : "Set Online"}
              >
                <Dot className={`w-4 h-4 sm:w-5 sm:h-5 ${onlineFriends.some(u => u.id === user?.id) ? 'text-green-500' : 'text-gray-400'}`} />
              </button>
              <button
                className="p-1.5 sm:p-2 rounded-full hover:opacity-70 transition-colors txt-dim hover:txt"
                title="More Options"
              >
                <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
        </div>
      </div>

      {/* Messages Area - Responsive */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 lg:p-4 space-y-2 sm:space-y-3 lg:space-y-4">
        {messages.length === 0 ? (
          <div className="text-center txt-disabled mt-6 sm:mt-8">
            <p className="text-sm sm:text-base">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] px-2 py-1.5 sm:px-3 sm:py-2 lg:px-4 lg:py-2 rounded-2xl ${
                  msg.sender === "me"
                    ? "bg-[var(--btn)] text-white rounded-br-md"
                    : "rounded-bl-md txt"
                }`}
                style={{
                  backgroundColor:
                    msg.sender === "me"
                      ? "var(--btn)"
                      : "color-mix(in srgb, var(--bg-sec), black 10%)",
                }}
              >
                <p className="break-words text-xs sm:text-sm lg:text-base">
                  {msg.text}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    msg.sender === "me" ? "text-white/70" : "txt-disabled"
                  }`}
                >
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator - Responsive */}
        {isTyping && (
          <div className="flex justify-start">
            <div
              className="txt px-2 py-1.5 sm:px-3 sm:py-2 lg:px-4 lg:py-2 rounded-2xl rounded-bl-md"
              style={{
                backgroundColor: "color-mix(in srgb, var(--bg-sec), black 10%)",
              }}
            >
              <div className="flex space-x-1">
                <div
                  className="w-2 h-2 bg-txt-dim rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-txt-dim rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-txt-dim rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Responsive */}
      <div
        className="p-2 sm:p-3 lg:p-4 border-t border-gray-200/20 relative"
        style={{
          backgroundColor: "color-mix(in srgb, var(--bg-sec), black 10%)",
        }}
      >
        <div className="flex items-end gap-2 sm:gap-3">
          {/* Emoji Button */}
          <div className="relative">
            <button
              ref={emojiButtonRef}
              onClick={toggleEmojiPicker}
              className="p-2 rounded-full hover:opacity-70 transition-colors txt-dim hover:txt"
            >
              <Smile className="w-7 h-7" />
            </button>

            {/* Emoji Picker Popup */}
            {showEmoji && (
              <div
                ref={emojiPickerRef}
                className="absolute bottom-full left-0 mb-2 z-50"
                style={{ zIndex: 9999 }}
              >
                <EmojiPicker
                  data={data}
                  onEmojiSelect={onEmojiSelect}
                  theme="auto"
                  previewPosition="none"
                  skinTonePosition="none"
                />
              </div>
            )}
          </div>
          {/* Message Input */}
          <div
            className="flex-1 rounded-2xl border border-gray-200/20 focus-within:border-[var(--btn)] transition-colors"
            style={{
              backgroundColor: "color-mix(in srgb, var(--bg-ter), black 12%)",
            }}
          >
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setCursorPosition(e.target.selectionStart);
              }}
              onClick={handleTextareaClick}
              onKeyUp={handleTextareaKeyUp}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              className="w-full p-2 sm:p-3 bg-transparent resize-none txt placeholder-txt-disabled focus:outline-none text-sm sm:text-base"
              rows={1}
              style={{ maxHeight: "120px" }}
            />
          </div>

          {/* Send Button - Responsive */}
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className={`p-1.5 sm:p-2 rounded-full transition-colors ${
              message.trim()
                ? "bg-[var(--btn)] hover:bg-[var(--btn-hover)] text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;
