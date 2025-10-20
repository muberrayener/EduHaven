import { useState, useRef, useEffect, useCallback } from "react";
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
  Copy,
  Check,
  Edit2,
  AlertCircle,
  WifiOff,
  Square,
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

const formatBoldText = (text) => {
  return text.replace(/\*\*(.*?)\*\*/g, '<span class="message-bold">$1</span>')
  .replace(/\*(.*?)\*/g, '<em class="message-italic">$1</em>');
};

// Interactive Guided Experience System
const GUIDED_EXPERIENCES = {
  "study planning": {
    steps: [
      {
        id: 1,
        question: "What subject do you need help with?",
        options: ["Mathematics", "Science", "Languages", "History", "Computer Science", "Other"],
        type: "subject"
      },
      {
        id: 2,
        question: "What's your timeline?",
        options: ["Urgent (this week)", "Short-term (2-4 weeks)", "Long-term (1-3 months)", "Ongoing learning"],
        type: "timeline"
      },
      {
        id: 3,
        question: "What's your preferred learning style?",
        options: ["Visual learner", "Auditory learner", "Hands-on practice", "Reading/writing", "Mixed approach"],
        type: "style"
      },
      {
        id: 4,
        question: "What specific goal do you have?",
        options: ["Exam preparation", "Skill mastery", "Project completion", "General understanding", "Career advancement"],
        type: "goal"
      }
    ],
    finalResponse: (answers) => `🎯 **Your Personalized Study Plan**

Based on your preferences, here's your customized learning path:

**Subject Focus:** ${answers.subject}
**Timeline:** ${answers.timeline}
**Learning Style:** ${answers.style}
**Primary Goal:** ${answers.goal}

**Recommended Actions:**
1. **Session Type:** ${answers.timeline === 'Urgent (this week)' ? 'Intensive 1-on-1 tutoring' : 'Group study sessions'}
2. **Study Materials:** ${answers.style === 'Visual learner' ? 'Visual notes and diagrams' : 'Comprehensive text resources'}
3. **Practice Approach:** ${answers.goal === 'Exam preparation' ? 'Mock tests and quizzes' : 'Project-based learning'}
4. **Schedule:** ${answers.timeline === 'Long-term (1-3 months)' ? 'Weekly 2-hour sessions' : 'Daily 1-hour sessions'}

**Next Steps:**
• Book your first session now
• Set up your study materials
• Connect with peers studying ${answers.subject}
• Track your progress weekly

*Ready to start your learning journey? I can help you book your first session!*`
  },
  "session booking": {
    steps: [
      {
        id: 1,
        question: "What type of session are you looking for?",
        options: ["Group Study", "1-on-1 Tutoring", "Exam Prep", "Topic Deep Dive", "Project Help"],
        type: "sessionType"
      },
      {
        id: 2,
        question: "Preferred time of day?",
        options: ["Morning (8AM-12PM)", "Afternoon (12PM-5PM)", "Evening (5PM-9PM)", "Weekend"],
        type: "timePreference"
      },
      {
        id: 3,
        question: "Session duration?",
        options: ["30 minutes", "1 hour", "1.5 hours", "2 hours"],
        type: "duration"
      },
      {
        id: 4,
        question: "Do you need any specific tools?",
        options: ["Whiteboard", "Screen sharing", "Recording", "File sharing", "All basic tools"],
        type: "tools"
      }
    ],
    finalResponse: (answers) => `📅 **Session Booking Summary**

Perfect! Here's your session setup:

**Session Type:** ${answers.sessionType}
**Preferred Time:** ${answers.timePreference}
**Duration:** ${answers.duration}
**Tools:** ${answers.tools}

**Available Sessions Matching Your Preferences:**
• **Tomorrow ${answers.timePreference}** - ${answers.sessionType} on your chosen topic
• **This Weekend** - Group study with peers
• **Flexible Slots** - Multiple ${answers.duration} sessions available

**Session Features Included:**
✅ Real-time collaboration
✅ ${answers.tools} access
✅ Progress tracking
✅ Session recording
✅ Expert support

**Ready to confirm your booking?** 
*Click "Book Now" to secure your spot, or ask me about specific topics!*`
  },
  "note taking": {
    steps: [
      {
        id: 1,
        question: "What will you be taking notes for?",
        options: ["Lecture/Class", "Book/Reading", "Research", "Meeting", "Personal Study", "Project"],
        type: "purpose"
      },
      {
        id: 2,
        question: "Preferred note format?",
        options: ["Text Notes", "Audio Notes", "Visual Notes", "Flashcards", "Mixed Format"],
        type: "format"
      },
      {
        id: 3,
        question: "How organized do you want your notes?",
        options: ["Simple & Quick", "Moderately Organized", "Highly Structured", "Academic Standard"],
        type: "organization"
      },
      {
        id: 4,
        question: "Do you need AI assistance?",
        options: ["Auto-summarization", "Key points extraction", "Mind maps", "Study questions", "All features"],
        type: "aiFeatures"
      }
    ],
    finalResponse: (answers) => `📝 **Your Smart Note-Taking Setup**

Excellent choice! Here's your customized note-taking system:

**Purpose:** ${answers.purpose}
**Format:** ${answers.format}
**Organization Level:** ${answers.organization}
**AI Features:** ${answers.aiFeatures}

**Recommended Setup:**
1. **Template:** ${answers.organization === 'Highly Structured' ? 'Cornell Note System' : 'Bullet-point format'}
2. **Tools:** ${answers.format === 'Visual Notes' ? 'Diagram creator + text editor' : 'Advanced text editor with audio sync'}
3. **AI Assistance:** ${answers.aiFeatures} enabled
4. **Organization:** ${answers.organization === 'Simple & Quick' ? 'Tag-based system' : 'Folder hierarchy with tags'}

**Pro Features Activated:**
• Smart search across all notes
• Cross-reference similar content
• Automatic backup to cloud
• Mobile sync available
• Export to multiple formats

**Getting Started:**
1. Create your first note template
2. Set up your organization system
3. Enable AI features
4. Start capturing knowledge!

*Would you like me to create your first note template now?*`
  }
};

// Hardcoded responses for specific queries
const HARDCODED_RESPONSES = {
  "show me study sessions": `🎯 **Study Sessions at EduHaven**

We offer various types of study sessions to suit your learning style:

• **Group Study Sessions** - Collaborate with peers (2-5 people)
• **1-on-1 Tutoring** - Personalized attention from expert tutors
• **Exam Prep Sessions** - Focused preparation for upcoming tests
• **Topic Deep Dives** - Master specific subjects in detail

**Features:**
✅ Real-time whiteboard collaboration
✅ Screen sharing capabilities  
✅ Session recording and playback
✅ Progress tracking and analytics

*What specific type of session are you interested in? I can help you find the perfect fit!*`,

  "how do i join learning games": `🎮 **Join Learning Games**

Getting started with our educational games is easy! Here's how:

**Step-by-Step Guide:**
1. **Browse Games** - Explore our game library by subject and difficulty
2. **Choose Your Game** - Select from quizzes, puzzles, or interactive challenges
3. **Invite Friends** (Optional) - Play solo or with study buddies
4. **Track Progress** - Earn points and unlock achievements

**Popular Game Categories:**
• 🧠 Brain Teasers & Puzzles
• 📚 Subject-Specific Challenges  
• 🏆 Competitive Learning Tournaments
• 🤝 Collaborative Team Games

*Ready to make learning fun? Which subject would you like to game-ify?*`,

  "how can i create study notes": `📝 **Create Smart Study Notes**

EduHaven's AI-powered note-taking system helps you create effective study materials:

**Note Creation Options:**
• **Text Notes** - Traditional typing with rich formatting
• **Audio Notes** - Record and transcribe lectures
• **Visual Notes** - Add diagrams, screenshots, and images
• **Flashcards** - Create interactive study cards

**AI-Powered Features:**
🤖 **Auto-Summarization** - Condense long texts
🎯 **Key Point Extraction** - Identify important concepts
📊 **Visual Organization** - Mind maps and flowcharts
🔍 **Smart Search** - Find notes instantly

**Pro Tips:**
• Use the Cornell note-taking method
• Color-code by topic or priority
• Add timestamps for video content
• Share notes with study groups

*Would you like help setting up your first note-taking system?*`,

  "i need help with learning": `💫 **Learning Support & Resources**

I'm here to help you overcome any learning challenges! Here are our support options:

**Immediate Help:**
• 🎯 **Personalized Tutoring** - Get 1-on-1 expert help
• 📚 **Study Plan Creation** - Custom learning roadmap
• 🧠 **Learning Strategy** - Effective study techniques
• ⏰ **Time Management** - Schedule optimization

**Additional Resources:**
• Video tutorials and walkthroughs
• Practice exercises with solutions
• Progress tracking and analytics
• Peer support communities

**Common Solutions:**
• Breaking down complex topics
• Improving focus and concentration
• Managing study stress
• Preparing for exams effectively

*Tell me more about what you're struggling with, and I'll provide specific guidance!*`,

  "who are you": `🤖 **About EduHaven AI**

I'm your intelligent learning assistant, powered by advanced AI technology! Here's what I can do for you:

**My Capabilities:**
• Answer questions about all EduHaven features
• Help you create effective study plans
• Explain complex concepts in simple terms
• Recommend learning resources and sessions
• Assist with note-taking and organization
• Provide motivation and learning strategies

**My Mission:**
To make your learning journey more effective, engaging, and personalized! I'm here 24/7 to support your educational goals.

**Quick Facts:**
• Powered by Gemini AI technology
• Integrated with all EduHaven platforms
• Constantly learning and improving
• Your personal learning companion

*What would you like to explore together today?*`,

  "about": `🏫 **About EduHaven Platform**

EduHaven is your comprehensive learning ecosystem designed to transform how you learn and grow:

**Our Vision:**
To create a world where learning is personalized, engaging, and accessible to everyone.

**Key Features:**
🎓 **Smart Sessions** - Interactive study environments
🤖 **AI Assistant** (That's me!) - 24/7 learning support
🎮 **Learning Games** - Gamified education
📝 **Digital Notes** - Advanced note-taking system
📊 **Progress Analytics** - Track your learning journey

**What Makes Us Different:**
• Personalized learning paths for every student
• AI-powered content recommendations
• Collaborative learning communities
• Real-time progress tracking
• Multi-format content support

**Join 50,000+ learners** who are already transforming their education with EduHaven!

*Ready to start your learning journey?*`,

  "what is eduhaven": `🚀 **Welcome to EduHaven!**

EduHaven is an innovative learning platform that combines cutting-edge technology with proven educational methods:

**Core Platform Features:**

📚 **Study Sessions**
- Live and recorded learning sessions
- Interactive whiteboards and tools
- Group collaboration spaces
- Expert tutor availability

🎯 **AI-Powered Learning**
- Personalized study recommendations
- Smart content organization
- Progress analytics and insights
- Adaptive learning paths

🎮 **Educational Games**
- Subject-specific challenges
- Competitive learning tournaments
- Collaborative team activities
- Achievement and reward system

📝 **Smart Note-Taking**
- Multi-format note creation
- AI-powered summarization
- Easy organization and search
- Sharing and collaboration

**Our Mission:** To make quality education engaging, accessible, and effective for every learner.

*Which feature would you like to explore first?*`
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

  const [conversationContext, setConversationContext] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 420, height: 720 });
  const resizing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startDimensions = useRef({ width: 420, height: 600 });
  const [showVideoSection, setShowVideoSection] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [isQuickActionsExpanded, setIsQuickActionsExpanded] = useState(false);

  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [apiError, setApiError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isTyping, setIsTyping] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState(null);

  // Interactive Guided Experience State
  const [currentExperience, setCurrentExperience] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [experienceAnswers, setExperienceAnswers] = useState({});

  // Typing effect state
  const [typingMessages, setTypingMessages] = useState({});

  const debounceTimerRef = useRef(null);
  const typingIntervalRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("edu_chat", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

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
        setConversationContext([]);
        setShowVideoSection(false);
        setApiError(null);
        setRateLimitInfo(null);
        // Reset guided experience
        setCurrentExperience(null);
        setCurrentStep(0);
        setExperienceAnswers({});
        // Reset typing effect
        setTypingMessages({});
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
      };
    }
  }, []);

  // scroll chat to end - but respect user scrolling during typing
useEffect(() => {
  if (isChatOpen && chatContainerRef.current) {
    const chatContainer = chatContainerRef.current;
    
    // Don't auto-scroll during typing effects
    const isTypingEffectRunning = Object.keys(typingMessages).length > 0;
    
    if (!isTypingEffectRunning) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }
}, [isChatOpen, messages]); // Remove typingMessages from dependencies

// Separate effect for when typing completes
useEffect(() => {
  if (isChatOpen && chatContainerRef.current) {
    const chatContainer = chatContainerRef.current;
    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage && lastMessage.type === "ai") {
      const typingState = typingMessages[lastMessage.id];
      
      // Scroll when typing completes
      if (typingState && typingState.isComplete) {
        setTimeout(() => {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }, 100);
      }
    }
  }
}, [typingMessages, isChatOpen, messages]);

  useEffect(() => {
    if (isChatOpen && !showVideoSection && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isChatOpen, showVideoSection]);

  // Start typing effect for a message
const startTypingEffect = useCallback((messageId, fullText) => {
  if (typingIntervalRef.current) {
    clearInterval(typingIntervalRef.current);
  }

  // Initialize with first character immediately for smooth start
  setTypingMessages(prev => ({
    ...prev,
    [messageId]: {
      displayedText: fullText.substring(0, 1),
      fullText,
      currentIndex: 1,
      isComplete: false
    }
  }));

  let currentIndex = 1; // Start from 1 since we already set the first character
  
  typingIntervalRef.current = setInterval(() => {
    currentIndex += 1;
    
    setTypingMessages(prev => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        displayedText: fullText.substring(0, currentIndex),
        currentIndex,
        isComplete: currentIndex >= fullText.length
      }
    }));

    if (currentIndex >= fullText.length) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
      
      // Clean up after a delay
      setTimeout(() => {
        setTypingMessages(prev => {
          const newTyping = { ...prev };
          delete newTyping[messageId];
          return newTyping;
        });
      }, 1000);
    }
  }, 20); // Slightly slower for smoother effect
}, []);

  const debouncedAction = useCallback((action, delay = 500) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      action();
    }, delay);
  }, []);

  // Check if query matches hardcoded responses or guided experiences
  const getHardcodedResponse = (query) => {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Check for guided experience triggers
    if (normalizedQuery.includes('study plan') || normalizedQuery.includes('learning plan') || normalizedQuery.includes('create study schedule')) {
      return { type: 'guided', experience: 'study planning' };
    }
    
    if (normalizedQuery.includes('book session') || normalizedQuery.includes('schedule session') || normalizedQuery.includes('join session')) {
      return { type: 'guided', experience: 'session booking' };
    }
    
    if (normalizedQuery.includes('setup notes') || normalizedQuery.includes('create notes') || normalizedQuery.includes('note system')) {
      return { type: 'guided', experience: 'note taking' };
    }
    
    // Exact matches for quick actions
    const exactMatches = {
      "show me study sessions": HARDCODED_RESPONSES["show me study sessions"],
      "how do i join learning games": HARDCODED_RESPONSES["how do i join learning games"],
      "how can i create study notes": HARDCODED_RESPONSES["how can i create study notes"],
      "i need help with learning": HARDCODED_RESPONSES["i need help with learning"],
    };
    
    if (exactMatches[normalizedQuery]) {
      return { type: 'hardcoded', response: exactMatches[normalizedQuery] };
    }
    
    // Keyword matches for general queries
    if (normalizedQuery.includes('who are you') || normalizedQuery.includes('what are you')) {
      return { type: 'hardcoded', response: HARDCODED_RESPONSES["who are you"] };
    }
    
    if (normalizedQuery.includes('about') && (normalizedQuery.includes('eduhaven') || normalizedQuery.length < 20)) {
      return { type: 'hardcoded', response: HARDCODED_RESPONSES["about"] };
    }
    
    if (normalizedQuery.includes('what is eduhaven') || normalizedQuery.includes('tell me about eduhaven')) {
      return { type: 'hardcoded', response: HARDCODED_RESPONSES["what is eduhaven"] };
    }
    
    return null;
  };

  // Start a guided experience
  const startGuidedExperience = (experienceKey) => {
    setCurrentExperience(experienceKey);
    setCurrentStep(0);
    setExperienceAnswers({});
    
    const experience = GUIDED_EXPERIENCES[experienceKey];
    const currentStepData = experience.steps[0];
    
    const guidedMessage = {
      id: Date.now(),
      type: "ai",
      text: `🎯 **${experienceKey.charAt(0).toUpperCase() + experienceKey.slice(1)} Setup**\n\n${currentStepData.question}`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isGuided: true,
      step: 0,
      options: currentStepData.options
    };
    
    setMessages(prev => [...prev, guidedMessage]);
  };

  // Handle option selection in guided experience
  const handleOptionSelect = (option, stepIndex) => {
    const experience = GUIDED_EXPERIENCES[currentExperience];
    const currentStepData = experience.steps[stepIndex];
    
    // Save answer
    setExperienceAnswers(prev => ({
      ...prev,
      [currentStepData.type]: option
    }));
    
    // Add user's selection to messages
    const userMessage = {
      id: Date.now(),
      type: "user",
      text: option,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Check if there are more steps
    if (stepIndex < experience.steps.length - 1) {
      // Move to next step
      const nextStep = stepIndex + 1;
      setCurrentStep(nextStep);
      
      const nextStepData = experience.steps[nextStep];
      
      setTimeout(() => {
        const nextMessage = {
          id: Date.now() + 1,
          type: "ai",
          text: nextStepData.question,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isGuided: true,
          step: nextStep,
          options: nextStepData.options
        };
        
        setMessages(prev => [...prev, nextMessage]);
      }, 500);
    } else {
      // Final step - show summary
      setCurrentExperience(null);
      setCurrentStep(0);
      
      setTimeout(() => {
        const finalResponse = experience.finalResponse({
          ...experienceAnswers,
          [currentStepData.type]: option
        });
        
        const finalMessage = {
          id: Date.now() + 1,
          type: "ai",
          text: finalResponse,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        
        setMessages(prev => [...prev, finalMessage]);
        setConversationContext(prev => [
          ...prev,
          { role: "assistant", text: finalResponse }
        ].slice(-10));
      }, 500);
    }
  };

  const generateQuestion = async (customQuestion = null) => {
    const questionToAsk = customQuestion || question;

    if (!questionToAsk.trim()) {
      return;
    }

    if (!isOnline) {
      setApiError("You are offline. Please check your internet connection.");
      return;
    }

    setLoading(true);
    setIsTyping(true);
    setApiError(null);

    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMessage = {
      id: Date.now(),
      type: "user",
      text: questionToAsk,
      time: currentTime
    };

    setMessages((prev) => [...prev, userMessage]);

    // Check for hardcoded response or guided experience first
    const response = getHardcodedResponse(questionToAsk);
    
    if (response) {
      if (response.type === 'guided') {
        // Start guided experience
        setTimeout(() => {
          startGuidedExperience(response.experience);
          setLoading(false);
          setIsTyping(false);
          setQuestion("");
          setShowQuickActions(false);
          setIsQuickActionsExpanded(false);
        }, 1000);
        return;
      } else if (response.type === 'hardcoded') {
        // Use hardcoded response with typing effect
        setTimeout(() => {
          const aiMessageId = Date.now() + 1;
          const aiMessage = {
            id: aiMessageId,
            type: "ai",
            text: response.response,
            time: currentTime,
          };
          
          setMessages((prev) => [...prev, aiMessage]);
          setConversationContext(prev => [
            ...prev,
            { role: "assistant", text: response.response }
          ].slice(-10));
          
          // Start typing effect for hardcoded response
          startTypingEffect(aiMessageId, response.response);
          
          setLoading(false);
          setIsTyping(false);
          setQuestion("");
          setShowQuickActions(false);
          setIsQuickActionsExpanded(false);
        }, 500);
        return;
      }
    }

    // Use AI model for other queries
    const updatedContext = [
      ...conversationContext,
      { role: "user", text: questionToAsk }
    ].slice(-10);
    setConversationContext(updatedContext);

    const contextPrompt = updatedContext.length > 1
      ? `You are EduHaven AI, an intelligent learning assistant for the EduHaven educational platform. 
      
Context of previous conversation:
${updatedContext.slice(0, -1).map(msg => `${msg.role}: ${msg.text}`).join('\n')}

Current question: ${questionToAsk}

EduHaven Platform Features:
- Study Sessions (group, 1-on-1, exam prep, topic deep dives)
- Learning Games (educational games, quizzes, tournaments)
- AI Notes (smart note-taking, flashcards, summarization)
- Progress Tracking and Analytics
- Collaborative Learning Tools

Please provide helpful, educational responses focused on learning, studying, and using the EduHaven platform. If the question is unrelated to education or learning, gently guide the conversation back to how EduHaven can help with learning goals.`
      : `You are EduHaven AI, an intelligent learning assistant for the EduHaven educational platform. 

EduHaven Platform Features:
- Study Sessions (group, 1-on-1, exam prep, topic deep dives)
- Learning Games (educational games, quizzes, tournaments)  
- AI Notes (smart note-taking, flashcards, summarization)
- Progress Tracking and Analytics
- Collaborative Learning Tools

Please provide helpful, educational responses focused on learning, studying, and using the EduHaven platform. If the question is unrelated to education or learning, gently guide the conversation back to how EduHaven can help with learning goals.

Current question: ${questionToAsk}`;

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
                parts: [{ text: contextPrompt }],
              },
            ],
          }),
        }
      );

      if (response.status === 429) {
        setRateLimitInfo({
          message: "Rate limit reached. Please wait a moment before trying again.",
          retryAfter: 60,
        });
        throw new Error("Rate limit exceeded");
      }

      const data = await response.json();

      if (data && data.candidates && data.candidates.length > 0) {
        const generatedResponse =
          data.candidates[0]?.content?.parts[0]?.text || "I apologize, but I couldn't generate a response. Please try again or ask about EduHaven's learning features!";
        
        // Create AI message
        const aiMessageId = Date.now() + 1;
        const aiMessage = {
          id: aiMessageId,
          type: "ai",
          text: generatedResponse,
          time: currentTime,
        };
        
        setMessages((prev) => [...prev, aiMessage]);
        setLoading(false);
        setIsTyping(false);
        
        // Start typing effect for AI response
        startTypingEffect(aiMessageId, generatedResponse);

        setConversationContext(prev => [
          ...prev,
          { role: "assistant", text: generatedResponse }
        ].slice(-10));
      }
    } catch (error) {
      console.error("Error generating response:", error);
      setApiError(
        error.message === "Rate limit exceeded"
          ? "Too many requests. Please wait a moment before trying again."
          : "Failed to get response from AI. Please try again."
      );
      setLoading(false);
      setIsTyping(false);
    } finally {
      setQuestion("");
      setShowQuickActions(false);
      setIsQuickActionsExpanded(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !loading) {
      e.preventDefault();
      debouncedAction(() => generateQuestion(), 300);
    }
  };

  const closeModal = () => {
    setIsChatOpen(false);
    setShowVideoSection(false);
    setApiError(null);
    setRateLimitInfo(null);
    // Reset guided experience
    setCurrentExperience(null);
    setCurrentStep(0);
    setExperienceAnswers({});
    // Reset typing effect
    setTypingMessages({});
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
  };

  const clearChat = () => {
    setMessages([]);
    setConversationContext([]);
    localStorage.removeItem("edu_chat");
    setShowQuickActions(true);
    setApiError(null);
    // Reset guided experience
    setCurrentExperience(null);
    setCurrentStep(0);
    setExperienceAnswers({});
    // Reset typing effect
    setTypingMessages({});
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
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

  const handleCopyMessage = (messageText, messageId) => {
    navigator.clipboard.writeText(messageText).then(() => {
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    });
  };

  const handleEditMessage = (messageId, messageText) => {
    setEditingMessageId(messageId);
    setEditedText(messageText);
  };

  const saveEditedMessage = () => {
    if (!editedText.trim()) return;

    const messageIndex = messages.findIndex(msg => msg.id === editingMessageId);
    if (messageIndex === -1) return;

    const updatedMessages = [...messages];
    updatedMessages[messageIndex] = {
      ...updatedMessages[messageIndex],
      text: editedText,
      edited: true,
    };

    const messagesToRemove = messages.slice(messageIndex + 1);
    const finalMessages = updatedMessages.slice(0, messageIndex + 1);

    setMessages(finalMessages);
    setEditingMessageId(null);
    setEditedText("");

    if (updatedMessages[messageIndex].type === "user") {
      generateQuestion(editedText);
    }
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditedText("");
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
    { label: "Find Sessions", query: "Show me study sessions"},
    { label: "Join Games", query: "How do I join learning games?"},
    { label: "Create Notes", query: "How can I create study notes?"},
    { label: "Get Help", query: "I need help with learning"},
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
              debouncedAction(() => {
                onActionClick(action.query);
              }, 200);
            }}
            className="px-3 py-2.5 text-xs font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-200 text-left break-words min-h-[44px] flex items-center"
          >
            {action.label}
          </motion.button>
        ))}
      </div>
    </div>
  );

  // Options Component for Guided Experience
  const OptionsList = ({ options, step, onOptionSelect }) => (
    <div className="mt-3 space-y-2">
      <div className="grid grid-cols-1 gap-2">
        {options.map((option, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onOptionSelect(option, step)}
            className="w-full px-4 py-3 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {option}
          </motion.button>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
        Select an option to continue
      </p>
    </div>
  );

  const stopGeneration = () => {
  if (typingIntervalRef.current) {
    clearInterval(typingIntervalRef.current);
    typingIntervalRef.current = null;
  }
  
  setLoading(false);
  setIsTyping(false);
  
  // Add "Stopped" message
  const currentTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  
  const stoppedMessage = {
    id: Date.now() + 1,
    type: "ai",
    text: "Whoa, stop! That wasn’t what you were expecting, was it?",
    time: currentTime,
  };
  
  setMessages(prev => [...prev, stoppedMessage]);
  setConversationContext(prev => [
    ...prev,
    { role: "assistant", text: "Whoa, stop! That wasn’t what you were expecting, was it?" }
  ].slice(-10));
  
  // Clear any ongoing typing effects
  setTypingMessages({});
};

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

        @keyframes morph-blob {
  0%, 100% {
    border-radius: 63% 37% 54% 46% / 55% 48% 52% 45%;
    transform: scale(1) rotate(0deg);
  }
  25% {
    border-radius: 40% 60% 54% 46% / 49% 60% 40% 51%;
    transform: scale(1.05) rotate(90deg);
  }
  50% {
    border-radius: 60% 40% 37% 63% / 61% 35% 65% 39%;
    transform: scale(1.03) rotate(180deg);
  }
  75% {
    border-radius: 33% 67% 53% 47% / 72% 31% 69% 28%;
    transform: scale(1.07) rotate(270deg);
  }
}

.shimmer-effect {
  position: relative;
  overflow: hidden;
}

.shimmer-effect::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(
    45deg,
    rgba(var(--shadow-rgb), 0.1),
    rgba(var(--shadow-rgb), 0.4),
    rgba(var(--shadow-rgb), 0.1),
    rgba(var(--shadow-rgb), 0.3)
  );
  animation: morph-blob 8s ease-in-out infinite;
  z-index: -1;
}

        @keyframes particle-float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.3; }
          25% { transform: translate(10px, -10px) rotate(90deg); opacity: 0.6; }
          50% { transform: translate(0, -20px) rotate(180deg); opacity: 0.3; }
          75% { transform: translate(-10px, -10px) rotate(270deg); opacity: 0.6; }
        }

        @keyframes typing-dots {
          0%, 20% { opacity: 0.2; }
          50% { opacity: 1; }
          100% { opacity: 0.2; }
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

        .message-bold {
          font-weight: 750;
          color: inherit;
        }

        .message-italic {
          font-style: italic;
          color: inherit;
        }

        .glow-text {
          text-shadow: 0 0 10px rgba(var(--shadow-rgb), 0.5),
                       0 0 20px rgba(var(--shadow-rgb), 0.3);
        }

        .input-glow:focus {
          box-shadow: 0 0 0 3px rgba(var(--shadow-rgb), 0.2),
                      0 0 20px rgba(var(--shadow-rgb), 0.1);
        }

        .typing-dot {
          animation: typing-dots 1.4s infinite;
        }

        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        .typing-cursor {
          display: inline-block;
          width: 2px;
          height: 1em;
          background-color: currentColor;
          margin-left: 2px;
          animation: blink 1s infinite;
          vertical-align: middle;
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        .message-content {
          min-height: 1.5em;
          line-height: 1.5;
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
                  {!isOnline && (
                    <div className="flex items-center gap-1 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">
                      <WifiOff className="w-3 h-3" />
                      <span>Offline</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
  {!showVideoSection && messages.length > 0 && (
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
                    {apiError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2"
                      >
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-red-700 dark:text-red-300">{apiError}</p>
                          {rateLimitInfo && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                              Please wait {rateLimitInfo.retryAfter} seconds before trying again.
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setApiError(null);
                            setRateLimitInfo(null);
                          }}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}

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
                          key={msg.id}
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
                          {editingMessageId === msg.id ? (
                            <div className="w-full max-w-[85%] space-y-2">
                              <textarea
                                value={editedText}
                                onChange={(e) => setEditedText(e.target.value)}
                                className="w-full p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                rows={3}
                                autoFocus
                              />
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={cancelEdit}
                                  className="px-3 py-1.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={saveEditedMessage}
                                  className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="relative group">
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
                                  <div className="message-content">
                                    {msg.type === "ai" && typingMessages[msg.id] ? (
                                      <p 
                                        className="txt leading-relaxed whitespace-pre-wrap"
                                        dangerouslySetInnerHTML={{ 
                                          __html: formatBoldText(typingMessages[msg.id].displayedText) + 
                                                  (!typingMessages[msg.id].isComplete ? '<span class="typing-cursor"></span>' : '')
                                        }}
                                      />
                                    ) : (
                                      <p 
        className="txt leading-relaxed whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: formatBoldText(msg.text) }}
      />
                                    )}
                                  </div>
                                  {msg.edited && (
                                    <span className="text-xs text-gray-400 dark:text-gray-500 italic mt-1 block">
                                      (edited)
                                    </span>
                                  )}
                                  
                                  {/* Guided Experience Options */}
                                  {msg.isGuided && msg.options && (
                                    <OptionsList 
                                      options={msg.options} 
                                      step={msg.step}
                                      onOptionSelect={handleOptionSelect}
                                    />
                                  )}
                                </div>
                                <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity -mt-8">
                                  {msg.type === "ai" && !msg.isGuided && (!typingMessages[msg.id] || typingMessages[msg.id]?.isComplete) && (
                                    <button
                                      onClick={() => handleCopyMessage(msg.text, msg.id)}
                                      className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                                      title="Copy message"
                                    >
                                      {copiedMessageId === msg.id ? (
                                        <Check className="w-3.5 h-3.5 text-green-500" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                                      )}
                                    </button>
                                  )}
                                  {msg.type === "user" && (
                                    <button
                                      onClick={() => handleEditMessage(msg.id, msg.text)}
                                      className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                                      title="Edit message"
                                    >
                                      <Edit2 className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <span
                                className="text-xs txt-dim mt-1.5 font-medium"
                                style={{ opacity: 0.7 }}
                              >
                                {msg.time}
                              </span>
                            </>
                          )}
                        </motion.div>
                      ))
                    )}
                    {(loading || isTyping) && (
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
                              <div className="w-2 h-2 bg-indigo-400 rounded-full typing-dot"></div>
                              <div className="w-2 h-2 bg-indigo-400 rounded-full typing-dot"></div>
                              <div className="w-2 h-2 bg-indigo-400 rounded-full typing-dot"></div>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">AI is thinking...</span>
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
                                    debouncedAction(() => {
                                      setQuestion(action.query);
                                      setTimeout(() => {
                                        generateQuestion();
                                        setShowQuickActions(false);
                                      }, 100);
                                    }, 200);
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
                        disabled={loading || !isOnline || currentExperience}
                      />
                      <motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  onClick={() => {
    if (loading || isTyping || Object.keys(typingMessages).length > 0) {
      stopGeneration();
    } else {
      debouncedAction(() => generateQuestion(), 300);
    }
  }}
  disabled={(!question.trim() && !(loading || isTyping || Object.keys(typingMessages).length > 0)) || !isOnline || currentExperience}
  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all flex-shrink-0 ${
    loading || isTyping || Object.keys(typingMessages).length > 0
      ? "bg-gradient-to-r from-red-600 to-pink-600 dark:from-red-500 dark:to-pink-500"
      : "bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500"
  }`}
>
  {loading || isTyping || Object.keys(typingMessages).length > 0 ? (
    <Square className="w-4 h-4 sm:w-5 sm:h-5" />
  ) : (
    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
  )}
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
                              debouncedAction(() => {
                                setQuestion(query);
                                setTimeout(generateQuestion, 100);
                                setIsQuickActionsExpanded(false);
                              }, 200);
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