import { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  BotMessageSquare,
  X,
  ArrowUp,
  Loader,
  Spline,
  Trash2,
  Sparkles,
  Zap,
  MessageCircle,
  Calendar,
  Trophy,
  Code,
  Users,
  Star,
  Clock,
  TrendingUp,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const apikey = import.meta.env.VITE_GEMINI_KEY;

// Variants for the chat panel
const panelVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
};

// Variants for each chat message
const messageVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1 },
  }),
};

const Ai = () => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const videoRef = useRef(null);

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("edu_chat");
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem("edu_chat", JSON.stringify(messages));
  }, [messages]);

  const [loading, setLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 420, height: 600 });
  const resizing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startDimensions = useRef({ width: 420, height: 600 });
  const [showVideoSection, setShowVideoSection] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [isQuickActionsExpanded, setIsQuickActionsExpanded] = useState(false);

  useEffect(() => {
    const modalEl = document.getElementById("my_modal_1");
    if (modalEl) {
      modalEl.showModal = () => {
        setIsChatOpen(true);
        setShowVideoSection(true);
      };
      modalEl.close = () => {
        setIsChatOpen(false);
        setMessages([]);
        setShowVideoSection(false);
      };
    }
  }, []);

  // scroll chat to end
  useEffect(() => {
    if (isChatOpen && chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [isChatOpen, messages]);

  useEffect(() => {
    if (isChatOpen && !showVideoSection && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isChatOpen, showVideoSection]);

  const generateQuestion = async () => {
    if (!question.trim()) {
      return;
    }

    setLoading(true);
    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const userMessage = { type: "user", text: question, time: currentTime };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apikey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: question }],
              },
            ],
          }),
        }
      );

      const data = await response.json();

      if (data && data.candidates && data.candidates.length > 0) {
        const generatedResponse =
          data.candidates[0]?.content?.parts[0]?.text || "No response found";
        const aiMessage = {
          type: "ai",
          text: generatedResponse,
          time: currentTime,
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error("Error generating response:", error);
    } finally {
      setLoading(false);
      setQuestion("");
      setShowQuickActions(false);
      setIsQuickActionsExpanded(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) {
      generateQuestion();
    }
  };

  const closeModal = () => {
    setIsChatOpen(false);
    setShowVideoSection(false);
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("edu_chat");
    setShowQuickActions(true);
  };

  const handleStartChat = () => {
    setShowVideoSection(false);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const handleVideoEnd = () => {
    setShowVideoSection(false);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  // --- Resizable functionality from the top-left corner ---
  const handleMouseDown = (e) => {
    resizing.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    startDimensions.current = { ...dimensions };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!resizing.current) return;
    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;
    const newWidth = Math.min(
      Math.max(startDimensions.current.width - deltaX, 350),
      window.innerWidth * 0.96
    );
    const newHeight = Math.min(
      Math.max(startDimensions.current.height - deltaY, 450),
      window.innerHeight * 0.94
    );
    setDimensions({ width: newWidth, height: newHeight });
  };

  const handleMouseUp = () => {
    resizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };
  // --- End resizable functionality ---

  const trendingFeatures = [
    { name: "Study Sessions", emoji: "📚", users: "1.2K" },
    { name: "AI Notes", emoji: "🤖", users: "2.5K" },
    { name: "Game Learning", emoji: "🎮", users: "1.8K" },
    { name: "Live Classes", emoji: "🎥", users: "3.2K" }
  ];

  const quickActions = [
    { label: "Find Sessions", query: "Show me study sessions", route: "/session" },
    { label: "Join Games", query: "How do I join learning games?", route: "/games" },
    { label: "Create Notes", query: "How can I create study notes?", route: "/notes" },
    { label: "Get Help", query: "I need help with learning", route: "/about" },
  ];

  const QuickActionsMenu = ({ quickActions, onActionClick }) => (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Quick Actions
        </p>
        <button
          onClick={() => setIsQuickActionsExpanded(false)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {quickActions.map((action, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (action.route) {
                navigate(action.route);
              }
              onActionClick(action.query);
            }}
            className="px-3 py-2.5 text-xs font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-200 text-left break-words min-h-[44px] flex items-center"
          >
            {action.label}
          </motion.button>
        ))}
      </div>
    </div>
  );

  return (
    <div id="manishai">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 4px 30px rgba(var(--shadow-rgb), 0.4),
                        0 0 60px rgba(var(--shadow-rgb), 0.2);
          }
          50% {
            box-shadow: 0 4px 50px rgba(var(--shadow-rgb), 0.7),
                        0 0 80px rgba(var(--shadow-rgb), 0.4);
          }
        }

        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        @keyframes particle-float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.3; }
          25% { transform: translate(10px, -10px) rotate(90deg); opacity: 0.6; }
          50% { transform: translate(0, -20px) rotate(180deg); opacity: 0.3; }
          75% { transform: translate(-10px, -10px) rotate(270deg); opacity: 0.6; }
        }

        .ai-btn-wrapper {
          position: relative;
          display: inline-block;
        }

        .ai-btn-wrapper::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 12px;
          background: linear-gradient(45deg,
            var(--btn),
            var(--btn-hover),
            var(--btn));
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
          opacity: 0.6;
          filter: blur(8px);
          z-index: -1;
        }

        .ai-ask-btn {
          animation: float 3s ease-in-out infinite;
          transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .ai-ask-btn:hover {
          transform: scale(1.05);
        }

        .chat-panel-wrapper {
          animation: pulse-glow 3s ease-in-out infinite;
        }

        .message-bubble {
          animation: slideInUp 0.3s ease-out;
        }

        .gradient-border {
          position: relative;
          border: 2px solid transparent;
          background: var(--bg-ter);
          background-clip: padding-box;
        }

        .gradient-border::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 2px;
          background: linear-gradient(135deg,
            var(--btn),
            var(--btn-hover),
            var(--btn));
          -webkit-mask: linear-gradient(#fff 0 0) content-box,
                        linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: gradient-shift 3s linear infinite;
          background-size: 200% 200%;
        }

        .shimmer-effect {
          position: relative;
          overflow: hidden;
        }

        .shimmer-effect::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          animation: shimmer 2s infinite;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: var(--btn);
          border-radius: 50%;
          pointer-events: none;
          opacity: 0.3;
        }

        .particle:nth-child(1) { animation: particle-float 4s infinite; top: 10%; left: 10%; }
        .particle:nth-child(2) { animation: particle-float 5s infinite 0.5s; top: 20%; left: 80%; }
        .particle:nth-child(3) { animation: particle-float 6s infinite 1s; top: 70%; left: 20%; }
        .particle:nth-child(4) { animation: particle-float 4.5s infinite 1.5s; top: 80%; left: 70%; }
        .particle:nth-child(5) { animation: particle-float 5.5s infinite 2s; top: 40%; left: 50%; }

        .video-grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(var(--shadow-rgb), 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(var(--shadow-rgb), 0.03) 1px, transparent 1px);
          background-size: 20px 20px;
          pointer-events: none;
          opacity: 0.5;
        }

        .glow-text {
          text-shadow: 0 0 10px rgba(var(--shadow-rgb), 0.5),
                       0 0 20px rgba(var(--shadow-rgb), 0.3);
        }

        .input-glow:focus {
          box-shadow: 0 0 0 3px rgba(var(--shadow-rgb), 0.2),
                      0 0 20px rgba(var(--shadow-rgb), 0.1);
        }
      `}</style>

      {/* Ask AI Button - Using original Button component with new styles */}
      <div className="ai-btn-wrapper">
        <Button
          size="lg"
          variant="default"
          className="ai-ask-btn shadow-[0_4px_100px_rgba(176,71,255,0.7)] font-semibold hover:shadow-[0_4px_100px_rgba(176,71,255,1)] flex items-center gap-3"
          onClick={() => {
            const modalEl = document.getElementById("my_modal_1");
            modalEl && modalEl.showModal();
          }}
        >
          <BotMessageSquare />
          Ask AI
          <Sparkles className="w-4 h-4" />
        </Button>
      </div>

      {/* Chat Panel: render into document.body via portal so close is reliable */}
      {ReactDOM.createPortal(
        <div
          // overlay container
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            pointerEvents: isChatOpen ? "auto" : "none",
          }}
        >
          {/* overlay: clicking outside closes */}
          <div
            onClick={() => setIsChatOpen(false)}
            style={{
              position: "absolute",
              inset: 0,
              background: isChatOpen ? "rgba(0,0,0,0.4)" : "transparent",
              backdropFilter: isChatOpen ? "blur(4px)" : "none",
              transition: "all 300ms",
            }}
          />

          <motion.div
            id="my_modal_1"
            variants={panelVariants}
            initial="hidden"
            animate={isChatOpen ? "visible" : "hidden"}
            exit="hidden"
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              width: dimensions.width,
              height: dimensions.height,
            }}
            onClick={(e) => e.stopPropagation()}
            key="ai-portal-panel"
          >
            <div
              className="chat-panel-wrapper bg-primary rounded-3xl w-full h-full txt flex flex-col overflow-hidden relative"
              style={{
                boxShadow: `0 20px 60px rgba(var(--shadow-rgb), 0.5), 0 0 100px rgba(var(--shadow-rgb), 0.2)`,
                border: "1px solid rgba(var(--shadow-rgb), 0.2)",
              }}
            >
              <div className="video-grid-bg"></div>

              {/* Particles */}
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>

              {/* Resizer handle using the Spline icon */}
              <div
                onMouseDown={handleMouseDown}
                className="absolute top-2 left-2 p-2 cursor-nw-resize z-50 hover:bg-sec rounded-lg transition-all duration-200"
                style={{
                  background: "rgba(var(--shadow-rgb), 0.1)",
                }}
              >
                <Spline className="w-5 h-5 txt-dim" />
              </div>

              {/* Header */}
              <div
                className="flex justify-between items-center px-4 py-3 border-b backdrop-blur-sm relative z-10"
                style={{
                  borderColor: "rgba(var(--shadow-rgb), 0.2)",
                  background: "linear-gradient(to right, var(--bg-sec), var(--bg-primary))"
                }}
              >
                <div className="flex items-center gap-3 pl-8">
                  <div className="relative">
                    <BotMessageSquare className="w-6 h-6 txt" style={{ filter: "drop-shadow(0 0 8px rgba(var(--shadow-rgb), 0.6))" }} />
                    <Zap className="w-3 h-3 absolute -top-1 -right-1 txt" style={{ color: "var(--btn)" }} />
                  </div>
                  <h3 className="text-xl txt font-bold glow-text">EduHaven AI</h3>
                </div>
                <div className="flex items-center gap-2">
                  {messages.length > 0 && (
                    <button
                      onClick={clearChat}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all duration-300 hover:scale-105"
                      style={{
                        background: "rgba(239, 68, 68, 0.1)",
                        color: "#ef4444",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                      }}
                      title="Clear Chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="font-medium">Clear</span>
                    </button>
                  )}
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-sec rounded-full transition-all duration-200 txt-dim hover:txt hover:rotate-90"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Video/Welcome Section */}
              {showVideoSection && (
                <div
                  className="flex flex-col p-3 sm:p-4 overflow-y-auto bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"
                  style={{
                    flex: '1 1 auto',
                    minHeight: '0',
                  }}
                >
                  {/* Animated Background Elements */}
                  <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-indigo-300 to-purple-300 rounded-full opacity-20 blur-2xl animate-pulse"></div>
                  <div className="absolute bottom-20 left-10 w-16 h-16 bg-gradient-to-br from-pink-300 to-rose-300 rounded-full opacity-20 blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-gradient-to-br from-blue-300 to-indigo-300 rounded-full opacity-15 blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>

                  {/* Video Container */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="relative w-full mb-3"
                  >
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border-2 border-white/50 dark:border-gray-700/50 transform hover:scale-[1.02] transition-transform duration-300">
                      <video
      ref={videoRef}
      className="w-full h-full object-fill"
      onEnded={handleVideoEnd}
      playsInline
      autoPlay
    >
                        <source src="/eduhaven-intro.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none"></div>

                      {/* Overlay Welcome Text */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 1 }}
                        className="absolute bottom-0 left-0 right-0 p-3 text-white text-center"
                      >
                        <h3 className="text-base sm:text-lg font-bold mb-0.5 drop-shadow-2xl">
                          Welcome to EduHaven! 🎓
                        </h3>
                        <p className="text-xs opacity-90 drop-shadow-lg">Your learning journey starts here</p>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Trending Features Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.7 }}
                    className="mb-3 mt-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 text-indigo-600 dark:text-indigo-400" />
                        Popular Features
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Active Now</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {trendingFeatures.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 + index * 0.1 }}
                          whileHover={{ scale: 1.05 }}
                          className="rounded-xl p-2 border bg-white/80 dark:bg-gray-700/60 border-indigo-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-600/60 cursor-pointer transition-all"
                          onClick={() => {
                            setQuestion(`Tell me about ${feature.name}`);
                            setShowVideoSection(false);
                            setShowQuickActions(false);
                            setIsQuickActionsExpanded(false);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{feature.emoji}</span>
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                                {feature.name}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3 text-indigo-500" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {feature.users}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Feature Pills */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.7 }}
                    className="flex justify-center items-center mb-3 mt-4 w-full"
                  >
                    <div className="flex gap-1.5 justify-center items-center flex-nowrap px-2">
                      <div className="flex items-center space-x-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full px-2 py-1.5 shadow-lg text-[10px] xs:text-xs font-medium whitespace-nowrap flex-shrink-0">
                        <Calendar className="w-2.5 h-2.5 xs:w-3 xs:h-3 animate-bounce" style={{ animationDuration: '2s' }} />
                        <span>50+ Sessions</span>
                      </div>
                      <div className="flex items-center space-x-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full px-2 py-1.5 shadow-lg text-[10px] xs:text-xs font-medium whitespace-nowrap flex-shrink-0">
                        <Trophy className="w-2.5 h-2.5 xs:w-3 xs:h-3 animate-pulse" />
                        <span>Learning Games</span>
                      </div>
                      <div className="flex items-center space-x-1.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-full px-2 py-1.5 shadow-lg text-[10px] xs:text-xs font-medium whitespace-nowrap flex-shrink-0">
                        <Clock className="w-2.5 h-2.5 xs:w-3 xs:h-3 animate-spin" style={{ animationDuration: '3s' }} />
                        <span>24/7 Support</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Feature Cards */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.7 }}
                    className="grid grid-cols-3 gap-2 mb-3"
                  >
                    <div 
                      className="rounded-xl p-2 text-center border shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all bg-white/90 dark:bg-gray-700/90 border-indigo-200 dark:border-gray-600 cursor-pointer group"
                      onClick={() => navigate('/session')}
                    >
                      <div className="text-2xl mb-0.5 animate-bounce group-hover:animate-none" style={{ animationDuration: '2s' }}>
                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">Sessions</div>
                    </div>
                    <div 
                      className="rounded-xl p-2 text-center border shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all bg-white/90 dark:bg-gray-700/90 border-indigo-200 dark:border-gray-600 cursor-pointer group"
                      onClick={() => navigate('/games')}
                    >
                      <div className="text-2xl mb-0.5 animate-bounce group-hover:animate-none" style={{ animationDuration: '2s' }}>
                        <Trophy className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">Games</div>
                    </div>
                    <div 
                      className="rounded-xl p-2 text-center border shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all bg-white/90 dark:bg-gray-700/90 border-indigo-200 dark:border-gray-600 cursor-pointer group"
                      onClick={() => navigate('/notes')}
                    >
                      <div className="text-2xl mb-0.5 animate-bounce group-hover:animate-none" style={{ animationDuration: '2s' }}>
                        <Code className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-pink-600 dark:text-pink-400" />
                      </div>
                      <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">Notes</div>
                    </div>
                  </motion.div>

                  {/* Info Text */}
                  <div className="text-center mb-3 px-2">
                    <p className="text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                      ✨ Get personalized learning recommendations instantly! ✨
                    </p>
                  </div>

                  {/* CTA Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.7 }}
                    className="mt-auto"
                  >
                    <button
                      onClick={handleStartChat}
                      className="relative w-full py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden group text-sm"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      <span className="relative flex items-center justify-center space-x-2">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        <span>Start Learning Journey</span>
                        <Sparkles className="w-4 h-4 animate-pulse" />
                      </span>
                    </button>
                    <div className="flex items-center justify-center mt-2 space-x-4">
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Join 2,000+ learners
                      </p>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Messages Container */}
              {!showVideoSection && (
                <>
                  <div
                    ref={chatContainerRef}
                    className="flex-1 p-5 overflow-y-auto space-y-4 relative z-10"
                    style={{
                      background: "radial-gradient(ellipse at top, rgba(var(--shadow-rgb), 0.03), transparent)",
                    }}
                  >
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full space-y-6">
                        <div className="relative">
                          <div
                            className="w-24 h-24 rounded-full flex items-center justify-center shimmer-effect"
                            style={{
                              background: `linear-gradient(135deg, rgba(var(--shadow-rgb), 0.2), rgba(var(--shadow-rgb), 0.05))`,
                              boxShadow: `0 0 40px rgba(var(--shadow-rgb), 0.3)`,
                            }}
                          >
                            <BotMessageSquare className="w-12 h-12" style={{ color: "var(--btn)" }} />
                          </div>
                        </div>
                        <div className="text-center space-y-2 px-4">
                          <p className="text-2xl font-bold txt glow-text">
                            Welcome to EduHaven AI
                          </p>
                          <p className="txt-dim text-sm">
                            Powered by advanced intelligence to help you learn and grow
                          </p>
                        </div>
                        <div className="flex gap-2 flex-wrap justify-center px-4">
                          {["Ask a question", "Get help", "Learn something new"].map((text, i) => (
                            <div
                              key={i}
                              className="px-4 py-2 rounded-full text-xs txt-dim border"
                              style={{
                                borderColor: "rgba(var(--shadow-rgb), 0.2)",
                                background: "rgba(var(--shadow-rgb), 0.05)",
                              }}
                            >
                              <MessageCircle className="w-3 h-3 inline mr-1" />
                              {text}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      messages.map((msg, index) => (
                        <motion.div
                          key={index}
                          custom={index}
                          variants={messageVariants}
                          initial="hidden"
                          animate="visible"
                          className={`flex flex-col message-bubble ${
                            msg.type === "user" ? "items-end" : "items-start"
                          }`}
                          style={{
                            animationDelay: `${index * 0.1}s`,
                          }}
                        >
                          <div
                            className={`py-3 px-4 rounded-2xl max-w-[85%] ${
                              msg.type === "user"
                                ? "gradient-border shimmer-effect"
                                : "bg-sec"
                            }`}
                            style={
                              msg.type === "user"
                                ? {
                                    background: `linear-gradient(135deg, rgba(var(--shadow-rgb), 0.15), rgba(var(--shadow-rgb), 0.05))`,
                                    backdropFilter: "blur(10px)",
                                    boxShadow: `0 4px 15px rgba(var(--shadow-rgb), 0.2)`,
                                  }
                                : {
                                    boxShadow: `0 2px 10px rgba(0, 0, 0, 0.1)`,
                                  }
                            }
                          >
                            <p className="txt leading-relaxed">{msg.text}</p>
                          </div>
                          <span
                            className="text-xs txt-dim mt-1.5 font-medium"
                            style={{ opacity: 0.7 }}
                          >
                            {msg.time}
                          </span>
                        </motion.div>
                      ))
                    )}
                    {loading && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start space-x-3"
                      >
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-600 dark:text-gray-300 border-2 border-white dark:border-gray-600">
                          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                        </div>
                        <div className="p-3 sm:p-4 rounded-2xl rounded-bl-md shadow-md border bg-white dark:bg-gray-800 border-indigo-100 dark:border-gray-700">
                          <div className="flex items-center space-x-3">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">Thinking...</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Initial Quick Actions */}
                  <AnimatePresence>
                    {showQuickActions && messages.length <= 1 && (
                      <motion.div
                        initial={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 sm:px-4 py-3 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
                          <div className="flex flex-col space-y-2">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 px-1">
                              Quick Actions
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              {quickActions.map((action, index) => (
                                <motion.button
                                  key={index}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.5 + index * 0.1 }}
                                  whileHover={{ 
                                    scale: 1.02,
                                    backgroundColor: "rgba(99, 102, 241, 0.1)"
                                  }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => {
                                    if (action.route) {
                                      navigate(action.route);
                                    }
                                    setQuestion(action.query);
                                    setTimeout(() => {
                                      generateQuestion();
                                      setShowQuickActions(false);
                                    }, 100);
                                  }}
                                  className="px-3 py-2.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-200 text-left break-words min-h-[44px] flex items-center"
                                >
                                  {action.label}
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Input Area */}
                  <div className="p-3 sm:p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      {/* Quick Actions Menu Button - Only show when collapsed */}
                      {!showQuickActions && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onClick={() => setIsQuickActionsExpanded(!isQuickActionsExpanded)}
                          className="w-10 h-10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all flex-shrink-0"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                          </svg>
                        </motion.button>
                      )}
                      
                      <textarea
                        ref={inputRef}
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about learning, sessions, notes..."
                        className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all resize-none overflow-hidden"
                        style={{
                          minHeight: '44px',
                          maxHeight: '80px',
                        }}
                        onInput={(e) => {
                          const target = e.target;
                          target.style.height = 'auto';
                          target.style.height = Math.min(target.scrollHeight, 80) + 'px';
                        }}
                        disabled={loading}
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={generateQuestion}
                        disabled={!question.trim() || loading}
                        className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white rounded-2xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all flex-shrink-0"
                      >
                        {loading ? <Loader className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4 sm:w-5 sm:h-5" />}
                      </motion.button>
                    </div>
                    
                    {/* Expanded Quick Actions Menu */}
                    <AnimatePresence>
                      {isQuickActionsExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 overflow-hidden"
                        >
                          <QuickActionsMenu 
                            quickActions={quickActions}
                            onActionClick={(query) => {
                              const action = quickActions.find(a => a.query === query);
                              if (action && action.route) {
                                navigate(action.route);
                              }
                              setQuestion(query);
                              setTimeout(generateQuestion, 100);
                              setIsQuickActionsExpanded(false);
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <div className="text-xs mt-3 text-center flex items-center justify-center space-x-1 text-gray-400 dark:text-gray-500">
                      <Sparkles className="w-3 h-3" />
                      <span>Press Enter to send • Shift+Enter for new line</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Ai;