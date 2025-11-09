import React from "react";
import { Button } from "./button";
import { Card, CardHeader, CardTitle, CardContent } from "./card";
import { Shield, Target } from "lucide-react";

export default function InterviewSetupStep2({ onBack, onNext }) {
  return (
    <Card className="border-slate-700 shadow-xl bg-gradient-to-br from-slate-800 to-slate-900 backdrop-blur-sm">
      <CardHeader className="text-center bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Target className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl text-white">
          Interview Guidelines
        </CardTitle>
        <p className="text-slate-300">Review and accept the guidelines</p>
      </CardHeader>

      <CardContent className="space-y-6 p-8">
        <Card className="border border-slate-600 shadow-lg bg-slate-700/50 backdrop-blur-lg mx-auto mt-7 max-w-xl">
          <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-600 border-b border-slate-600 px-6 py-4">
            <CardTitle className="text-lg text-white flex items-center space-x-2">
              <Shield className="w-5 h-5 text-purple-400" />
              <span>Terms & Interview Etiquette</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ul className="mt-4 text-sm text-slate-300 space-y-3 list-disc pl-5">
              <li>
                Ensure you are in a well-lit environment for clear video
                analysis.
              </li>
              <li>
                Maintain a good posture: sit upright and face the camera
                directly.
              </li>
              <li>Dress appropriately as you would for a real interview.</li>
              <li>Minimize background noise and distractions.</li>
              <li>Be prepared with a notepad and pen if needed.</li>
              <li>Keep your mobile phone on silent mode.</li>
              <li>Be honest and authentic in your responses.</li>
              <li>
                By starting, you agree to these terms and to being recorded
                for feedback purposes.
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="flex justify-between mt-8">
          <Button
            onClick={onBack}
            className="bg-slate-700 hover:bg-slate-600 text-white border border-slate-600"
          >
            Back
          </Button>

          <Button
            onClick={onNext}
            className="bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white ml-auto"
          >
            Start Interview
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}