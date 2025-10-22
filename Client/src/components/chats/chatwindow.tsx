import { useState, useRef, useEffect } from "react";
import { Send, MoreVertical, Smile, User, Users } from "lucide-react";
import EmojiPicker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import UseSocketContext from "../../contexts/SocketContext"; // adjust path if needed

function ChatWindow({ selectedUser }) {
  const { socket, isConnected, onlineUsers, user } = UseSocketContext();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const [showEmoji, setShowEmoji] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const textareaRef = useRef(null);

  function getRoomId(user1, user2) {
    return [user1, user2].sort().join("_");
  }

  useEffect(() => {
    if (socket && selectedUser && user) {
      const roomId = getRoomId(user.id, selectedUser.id);
      socket.emit("join_room", { roomId });
    }
  }, [socket, selectedUser, user]);

  // Receive real-time messages
  useEffect(() => {
  if (!socket || !selectedUser) return;

  const roomId = getRoomId(user.id, selectedUser.id); // Consistent shared room ID

  const handleReceiveMessage = (data) => {
    if (data.roomId !== roomId) return; // 🚨 Ignore if it's from another room

    setMessages((prev) => [
      ...prev,
      {
        id: data.id || Date.now(),
        text: data.message || data.text,
        sender: data.userId === user.id ? "me" : "other",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  };

  socket.on("new_message", handleReceiveMessage);

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


  // Listen for typing indicator
  useEffect(() => {
  if (!socket || !selectedUser) return;

  const handleTyping = (data) => {
    if (data.userId === selectedUser.id) {
      setIsTyping(data.isTyping);
    }
  };

  socket.on("user_typing", handleTyping);
  return () => socket.off("user_typing", handleTyping);
}, [socket, selectedUser]);


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
    if (!message.trim() || !selectedUser || !socket) return;

    const roomId = getRoomId(user.id, selectedUser.id); // 💡 shared roomId

    const newMessage = {
      id: Date.now(), // local fallback ID
      text: message,
      senderId: user.id,
      receiverId: selectedUser.id,
      roomId, // 🧠 include this
      timestamp: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      }),
    };

    // Do not add message locally (optimistic) to avoid duplicate when server echoes.
    // Emit to server; server will broadcast 'new_message' and listener will append it.
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
                {selectedUser.isGroup
                  ? `${Math.floor(Math.random() * 20) + 5} members`
                  : selectedUser.isOnline
                    ? "Online"
                    : "Last seen recently"}
              </p>
            </div>
          </div>

          {/* Action Buttons - Responsive sizing */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button className="p-1.5 sm:p-2 rounded-full hover:opacity-70 transition-colors txt-dim hover:txt">
              <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            {/* TODO: Connect to backend - Add video/voice call functionality */}
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
