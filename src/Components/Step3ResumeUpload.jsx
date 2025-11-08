import React from 'react';
import { Button } from './button';
import ResumeParser from '../Utils/ResumeParser';

export default function Step3ResumeUpload({ onBack, onResumeAnalysis }) {
  return (
    <div className="space-y-6">
      <p className="text-gray-600">
        Upload your resume to get more personalized interview questions.
      </p>
      <ResumeParser onAnalysisComplete={onResumeAnalysis} />

      <div className="flex justify-between mt-8">
        <Button
          onClick={onBack}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700"
        >
          Back
        </Button>
      </div>
    </div>
  );
}