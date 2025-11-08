import React from "react";
import { Link } from "react-router-dom";
import { Button } from "./button";
import { Badge } from "./badge";
import { ArrowLeft, Video, Clock } from "lucide-react";

export default function InterviewHeader({
  isStarted,
  selectedRole,
  selectedLevel,
  isCameraOn,
  timeLeft,
  user,
  onReset,
}) {
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <header className="border-b border-slate-200/60 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {isStarted ? (
            <Button
              variant="ghost"
              onClick={onReset}
              className="text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Reset
            </Button>
          ) : (
            <Link
              to="/"
              className="flex items-center space-x-2 text-slate-600 hover:text-purple-700 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Home</span>
            </Link>
          )}

          {isStarted && (
            <div className="flex items-center space-x-2">
              <Badge
                variant="outline"
                className="border-purple-300 text-purple-700 bg-purple-50"
              >
                {selectedRole}
              </Badge>
              <Badge
                variant="outline"
                className="border-teal-300 text-teal-700 bg-teal-50"
              >
                {selectedLevel}
              </Badge>
              {isCameraOn && (
                <Badge
                  variant="outline"
                  className="border-green-300 text-green-700 bg-green-50"
                >
                  <Video className="w-3 h-3 mr-1" />
                  Camera Active
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isStarted && timeLeft !== null && (
            <button
              type="button"
              className="flex items-center gap-2 px-5 py-2 rounded-full font-bold text-lg shadow-lg border-2 border-white focus:outline-none"
              style={{
                background:
                  "linear-gradient(135deg, #8b5cf6 0%, #14b8a6 100%)",
                color: "#fff",
                boxShadow: "0 0 16px #8b5cf6, 0 0 32px #14b8a6",
                transition: "box-shadow 0.3s",
              }}
              tabIndex={-1}
              aria-label="Interview Timer"
            >
              <Clock className="w-6 h-6 text-white drop-shadow" />
              <span className="tracking-widest">{formatTime(timeLeft)}</span>
            </button>
          )}

          {!user && (
            <Link to="/auth">
              <Button
                variant="outline"
                className="border-slate-300 text-purple-700 hover:bg-purple-50 active:bg-purple-200 focus:bg-purple-200 px-6 py-2 font-semibold shadow-sm hover:shadow-md transition-all duration-300"
              >
                Login / Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}