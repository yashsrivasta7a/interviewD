import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./card";
import { Zap } from "lucide-react";

export default function InterviewTipsPanel() {
  return (
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
            <span>
              Use the STAR method (Situation, Task, Action, Result)
            </span>
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
  );
}