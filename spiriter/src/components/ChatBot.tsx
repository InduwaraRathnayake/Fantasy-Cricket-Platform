"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { IoChatbubbleEllipsesSharp } from "react-icons/io5";
import MarkdownRenderer from "./MarkdownRender";


interface Message {
  role: "user" | "bot";
  content: string;
}

const initialMessages: Message[] = [
  {
    role: "bot" as const,
    content:
      "Hello! I am Spiriter , I can help you assists information about a player's personal details and statistics. What would you like to know?",
  },
  {
    role: "bot",
    content: `
You can ask me about:
- Player details and statistics
- Suggests the best possible team of 11 players
- List all the batsmen
    `,
  },
  {
    role: "bot",
    content: `
Feel free to ask questions like:
- "What categories of players are available?"
- "Who has the most total runs?"
- "Give me list of all players that have taken more than 10 wickets"
    `,
  },
];

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);


  


  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const tooltipTimer = setTimeout(() => setShowTooltip(true), 1000);
    const hideTimer = setTimeout(() => setShowTooltip(false), 6000);
    return () => {
      clearTimeout(tooltipTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to get response");
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: data.response || "Sorry, I encountered an error.",
        },
      ]);

      console.log("Bot: response.... ", messages);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Sorry, I encountered an error." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="chatbot fixed bottom-4 right-4 z-50">
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full right-0 mb-20 bg-black/30 text-white rounded-lg p-3 text-sm whitespace-nowrap shadow-lg"
            >
              <div className="relative">
                Need help? Chat with Spirit! 👋
                <div
                  className="absolute -bottom-2 right-4 w-0 h-0 
                              border-l-[8px] border-l-transparent
                              border-t-[8px] border-t-gray-600
                              border-r-[8px] border-r-transparent"
                ></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed bottom-4 right-4 z-50 "
        >
          <button
            onClick={() => setIsOpen(true)}
            className={`p-4 text-white rounded-full shadow-lg 
                      cursor-pointer
                     transition-all duration-200 
                     ${isOpen ? "hidden" : "flex"}
                      bg-white/10 hover:bg-white/15
                      transition-all duration-500 backdrop-blur-3xl
                     background-animate hover:shadow-xl`}
            style={{
              backgroundSize: "200% 200%",
            }}
          >
            <IoChatbubbleEllipsesSharp className="w-9 h-9 text-[#76b6e4] shadow-xl" />
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 w-[calc(100vw-2rem)] md:w-[500px] z-50"
          >
            <div className=" bg-white/5 backdrop-blur-xl rounded-lg shadow-xl overflow-hidden border border-white/20">
              <div className="bg-white/8 text-white font-geo text-xl p-4 flex justify-between items-center">
                <div className="flex flex-row gap-3 items-center w-full">
                  <h2 className="font-semibold select-none">SPIRITER AI</h2>
                  {/* <img
                    src="/logo.png"
                    alt="Bot"
                    className="w-28 rounded-2xl bg-black relative border border-white"
                  /> */}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-gray-300 transition-colors cursor-pointer"
                >
                  <IoMdClose className="w-6 h-6" />
                </button>
              </div>

              <div  className="chatcont h-[500px] overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-4 ${
                        message.role === "user"
                          ? "bg-[#76b6e4] text-white ml-auto "
                          : "bg-[#1789DC] text-white"
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm md:text-base flex flex-row gap-2 items-start">
                        {/* Bot Icon */}
                        {message.role !== "user" && (
                          <img
                            src="/bot.jpeg"
                            alt="Bot"
                            className="w-8 h-8 rounded-full bg-black relative"
                          />
                        )}

                        <span className="flex-1">
                          {/* Markdown with syntax highlighting */}
                          <MarkdownRenderer content={message.content} />
                        </span>

                        {/* User Icon */}
                        {message.role === "user" && (
                          <img
                            src="/userIcon.png"
                            alt="User"
                            className="w-8 h-8 rounded-full bg-gray-200 relative"
                          />
                        )}
                      </div>{" "}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-indigo-400 rounded-lg p-4">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-white/20 p-4">
                <form onSubmit={handleSubmit} className="flex space-x-4">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about player..."
                    className="flex-1 p-2  rounded-lg 
                              text-white
                             focus:outline-none focus:ring-1 focus:ring-[#76b6e4]
                             placeholder-gray-300"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-[#1789DC] text-white rounded-lg
                             hover:bg-[#5da5d8] hover:text-white
                             focus:outline-none focus:ring-z focus:ring-[#76b6e4]
                             disabled:opacity-50 transition-colors duration-200
                             font-medium cursor-pointer"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
