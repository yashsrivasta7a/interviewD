import React from "react";
import { Button } from "./button";
import { Card, CardHeader, CardTitle, CardContent } from "./card";
import { Target } from "lucide-react";
import ResumeParser from "../Utils/ResumeParser";

export default function InterviewSetupStep3({
  onBack,
  onAnalysisComplete,
  resumeUploaded,
}) {
  return (
    <Card className="border-slate-700 shadow-xl bg-gradient-to-br from-slate-800 to-slate-900 backdrop-blur-sm">
      <CardHeader className="text-center bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Target className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl text-white">
          Upload Your Resume
        </CardTitle>
        <p className="text-slate-300">
          Enhance your interview with your resume
        </p>
      </CardHeader>

      <CardContent className="space-y-6 p-8">
        
        <ResumeParser onAnalysisComplete={onAnalysisComplete} />

        <div className="flex justify-between mt-8">
          <Button
            onClick={onBack}
            className="bg-slate-700 hover:bg-slate-600 text-white border border-slate-600"
          >
            Back
          </Button>

          <Button
            disabled={!resumeUploaded}
            className="bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white ml-auto"
          >
            Start Interview
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}