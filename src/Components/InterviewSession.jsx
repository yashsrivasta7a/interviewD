import React from 'react';
import {
  Brain,
  Camera,
  Clock,
  Mic,
  MicOff,
  Send,
  Target,
  Video,
  VideoOff,
  Zap
} from 'lucide-react';
import { Button } from './button';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { Badge } from './badge';
import { Textarea } from './textarea';

export default function InterviewSession({
  selectedRole,
  selectedLevel,
  messages,
  currentInput,
  setCurrentInput,
  isLoading,
  currentQuestion,
  interviewQuestions,
  isComplete,
  userResponses,
  isCameraOn,
  handleVoiceInput,
  stopListening,
  isListening,
  sendMessage,
  videoRef,
  messagesEndRef,
  startCamera,
  stopCamera,
  setIsComplete,
  setShowResults,
  timeLeft,
  resetInterview
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Video Feed Card */}
      <div className="lg:col-span-1">
        <Card className="border-slate-200 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100">
            <CardTitle className="text-lg text-slate-900 flex items-center space-x-2">
              <Camera className="w-5 h-5 text-blue-600" />
              <span>Video Feed</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-48 rounded-lg border border-slate-200 bg-slate-100 object-cover mt-4"
            />
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-slate-500">
                Used for posture analysis feedback
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={isCameraOn ? stopCamera : startCamera}
                className={`transition-all duration-300 ${
                  isCameraOn
                    ? "border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                    : "border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {isCameraOn ? (
                  <>
                    <VideoOff className="w-4 h-4 mr-1" />
                    Stop
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4 mr-1" />
                    Start
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface */}
      <div className="lg:col-span-2">
        <Card className="h-[600px] flex flex-col border-slate-200 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-teal-50 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-teal-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-lg text-slate-900">
                AI Interview Session
              </CardTitle>
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

          {!isComplete && (
            <div className="p-4 border-t border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-slate-600">
                  Question {currentQuestion + 1} of {interviewQuestions.length}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsComplete(true);
                    setShowResults(true);
                  }}
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
                      sendMessage();
                    }
                  }}
                />
                <div className="flex flex-col space-y-2">
                  <Button
                    onClick={sendMessage}
                    disabled={!currentInput.trim() || isLoading}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    size="sm"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                  {!isListening ? (
                    <Button
                      onClick={handleVoiceInput}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      size="sm"
                    >
                      <Mic className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={stopListening}
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
      </div>

      {/* Progress and Tips */}
      <div className="space-y-6">
        <Card className="border-slate-200 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-slate-100">
            <CardTitle className="text-lg text-slate-900 flex items-center space-x-2">
              <Target className="w-5 h-5 text-teal-600" />
              <span>Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 mt-4">
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Questions Completed</span>
                <span className="text-slate-900 font-semibold">
                  {userResponses.length} / {interviewQuestions.length}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      (userResponses.length / interviewQuestions.length) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-coral-50 border-b border-slate-100">
            <CardTitle className="text-lg text-slate-900 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-purple-600" />
              <span>Interview Tips</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ul className="text-sm text-slate-700 space-y-3 mt-3">
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Be specific with examples</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Use the STAR method (Situation, Task, Action, Result)</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Take your time to think</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Maintain eye contact and confident body posture</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}