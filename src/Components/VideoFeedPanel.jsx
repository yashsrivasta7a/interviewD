import React from "react";
import { Button } from "./button";
import { Card, CardHeader, CardTitle, CardContent } from "./card";
import { Camera, Video, VideoOff } from "lucide-react";

export default function VideoFeedPanel({
  videoRef,
  isCameraOn,
  onStartCamera,
  onStopCamera,
}) {
  return (
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
            onClick={isCameraOn ? onStopCamera : onStartCamera}
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
  );
}