import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./card";
import { Target } from "lucide-react";

export default function ProgressPanel({
  completedQuestions,
  totalQuestions,
  compact = false,
}) {
  if (compact) {
    return (
      <div className="flex items-center space-x-3">
        <span className="text-sm text-slate-600">Progress:</span>
        <div className="w-32 bg-slate-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
            style={{
              width: `${(completedQuestions / totalQuestions) * 100}%`,
            }}
          />
        </div>
        <span className="text-sm text-slate-900 font-semibold">
          {completedQuestions}/{totalQuestions}
        </span>
      </div>
    );
  }

  return (
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
              {completedQuestions} / {totalQuestions}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
              style={{
                width: `${(completedQuestions / totalQuestions) * 100}%`,
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}