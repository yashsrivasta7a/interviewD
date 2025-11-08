import React, { useRef, useEffect, useState } from "react";
import { Button } from "./button";
import { Card, CardHeader, CardTitle, CardContent } from "./card";
import { Textarea } from "./textarea";
import { Brain, Send, Mic, MicOff, Code } from "lucide-react";
import LeetcodeFetch from "./LeetcodeFetch";

export default function ChatPanel({
  messages,
  currentInput,
  setCurrentInput,
  isLoading,
  isListening,
  currentQuestion,
  totalQuestions,
  isComplete,
  onSendMessage,
  onVoiceInput,
  onStopListening,
  onFinishInterview,
}) {
  const messagesEndRef = useRef(null);
  const [showLeetcode, setShowLeetcode] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Card className="h-[600px] flex flex-col border-slate-200 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-teal-50 border-b border-slate-200">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-teal-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-lg text-slate-900">
              AI Interview Session
            </CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLeetcode(true)}
            className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-all duration-300"
          >
            <Code className="w-4 h-4" />
            <span>LeetCode Profile</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 mt-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                message.type === "user"
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white"
                  : "bg-white border border-slate-200 text-slate-900"
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
              <p
                className={`text-xs mt-2 ${
                  message.type === "user"
                    ? "text-purple-200"
                    : "text-slate-500"
                }`}
              >
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-purple-600 animate-pulse" />
                <span className="text-sm text-slate-600">
                  AI is thinking...
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* LeetCode Integration */}
      {showLeetcode && <LeetcodeFetch />}

      {!isComplete && (
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-slate-600">
              Question {currentQuestion + 1} of {totalQuestions}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onFinishInterview}
              className="text-slate-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-all duration-300"
            >
              Finish Interview
            </Button>
          </div>

          <div className="flex space-x-3">
            <Textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Type your response here or use voice input..."
              className="flex-1 min-h-[60px] border-slate-300 focus:border-purple-500 focus:ring-purple-500/20 bg-white"
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSendMessage();
                }
              }}
            />
            <div className="flex flex-col space-y-2">
              <Button
                onClick={onSendMessage}
                disabled={!currentInput.trim() || isLoading}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
              {!isListening ? (
                <Button
                  onClick={onVoiceInput}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  size="sm"
                >
                  <Mic className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={onStopListening}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  size="sm"
                >
                  <MicOff className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {isListening && (
            <div className="text-sm text-slate-600 animate-pulse mt-2 text-center">
              🎤 Listening... Speak your answer now
            </div>
          )}
        </div>
      )}
    </Card>
  );
}