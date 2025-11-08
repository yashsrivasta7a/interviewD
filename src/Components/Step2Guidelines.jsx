import React from 'react';
import { Shield } from 'lucide-react';
import { Button } from './button';
import { Card, CardHeader, CardTitle, CardContent } from './card';

export default function Step2Guidelines({ onBack, onContinue }) {
  return (
    <div className="space-y-6">
      <Card className="border border-slate-200 shadow-lg bg-white/80 backdrop-blur-lg mx-auto mt-7 max-w-xl">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-slate-100 px-6 py-4">
          <CardTitle className="text-lg text-slate-900 flex items-center space-x-2">
            <Shield className="w-5 h-5 text-purple-600" />
            <span>Terms & Interview Etiquette</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ul className="mt-4 text-sm text-slate-700 space-y-3 list-disc pl-5">
            <li>
              Ensure you are in a well-lit environment for clear video analysis.
            </li>
            <li>
              Maintain a good posture: sit upright and face the camera directly.
            </li>
            <li>
              Dress appropriately as you would for a real interview.
            </li>
            <li>Minimize background noise and distractions.</li>
            <li>Be prepared with a notepad and pen if needed.</li>
            <li>Keep your mobile phone on silent mode.</li>
            <li>Be honest and authentic in your responses.</li>
            <li>
              By starting, you agree to these terms and to being recorded for
              feedback purposes.
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-between mt-8">
        <Button
          onClick={onBack}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700"
        >
          Back
        </Button>
        <Button
          onClick={onContinue}
          className="bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}