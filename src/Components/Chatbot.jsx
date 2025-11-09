import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { Button } from './button';
import { sendMessageToGemini } from '../Utils/geminiService';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! I'm your InterviewD assistant. I can help you learn about our AI-powered interview platform. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      const botResponse = await sendMessageToGemini(currentInput);

      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      const errorMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: "I'm experiencing technical difficulties. Please try again in a moment. 😊",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    "How does the AI interview work?",
    "What roles can I practice for?",
    "How is my resume analyzed?",
    "What feedback will I receive?"
  ];

  const handleQuickQuestion = (question) => {
    setInput(question);
    setTimeout(() => handleSend(), 100);
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 group"
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-teal-500 rounded-full blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-300 animate-pulse"></div>
            
            {/* Button */}
            <div className="relative bg-gradient-to-r from-purple-600 to-teal-500 text-white p-4 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform group-hover:scale-110">
              <MessageCircle className="w-6 h-6" />
              
              {/* Notification badge */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[420px] h-[600px] flex flex-col bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-teal-500 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-purple-600 rounded-full"></div>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">InterviewD Assistant</h3>
                <p className="text-white/80 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-900/50 to-slate-800/50 custom-scrollbar">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div className={`flex gap-2 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-br from-purple-500 to-purple-600' 
                      : 'bg-gradient-to-br from-teal-500 to-teal-600'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* Message bubble */}
                  <div>
                    <div className={`rounded-2xl p-3 ${
                      message.type === 'user'
                        ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white'
                        : 'bg-white/5 border border-white/10 text-gray-200 backdrop-blur-sm'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 px-2">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start animate-fadeIn">
                <div className="flex gap-2 max-w-[85%]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-teal-500 to-teal-600">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && !isLoading && (
            <div className="px-4 py-2 border-t border-white/5">
              <p className="text-xs text-gray-400 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickQuestion(q)}
                    className="text-xs bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-1.5 rounded-full border border-white/10 transition-all duration-200 hover:border-purple-500/50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-white/10 bg-slate-900/50">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about InterviewD..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-purple-600 to-teal-500 text-white p-2.5 rounded-xl hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Powered by AI • Always learning
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Chatbot;
