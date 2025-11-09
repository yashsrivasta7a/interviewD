import React, { useRef, useEffect } from "react";
import { Button } from "./button";
import { Card, CardHeader, CardTitle, CardContent } from "./card";
import { Target } from "lucide-react";
import ResumeParser from "../Utils/ResumeParser";

export default function InterviewSetupStep1({
  selectedRole,
  setSelectedRole,
  selectedLevel,
  setSelectedLevel,
  roleSearchTerm,
  setRoleSearchTerm,
  showRoleDropdown,
  setShowRoleDropdown,
  allRoles,
  onNext,
  onAnalysisComplete,
  resumeUploaded,
  includeCoding,
  setIncludeCoding
}) {
  const roleDropdownRef = useRef(null);

  const filteredRoles = allRoles.filter((role) =>
    role.toLowerCase().includes(roleSearchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(event.target)
      ) {
        setShowRoleDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowRoleDropdown]);

  return (
    <Card className="border-slate-700 shadow-xl bg-gradient-to-br from-slate-800 to-slate-900 backdrop-blur-sm">
      <CardHeader className="text-center bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Target className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl text-white">
          Setup Your AI Mock Interview
        </CardTitle>
        <p className="text-slate-300">
          Choose your role and experience level
        </p>
      </CardHeader>

      <CardContent className="space-y-6 p-8">
        <div className="mt-5">
          <label className="block text-sm font-medium text-white mb-3">
            What role are you interviewing for?
          </label>
          <div className="relative" ref={roleDropdownRef}>
            <input
              type="text"
              value={selectedRole || roleSearchTerm}
              onChange={(e) => {
                setRoleSearchTerm(e.target.value);
                setSelectedRole("");
                setShowRoleDropdown(true);
              }}
              onFocus={() => setShowRoleDropdown(true)}
              placeholder="Search for a role..."
              className="w-full p-3 rounded-lg border border-slate-600 bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {showRoleDropdown && (roleSearchTerm || !selectedRole) && (
              <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredRoles.length > 0 ? (
                  filteredRoles.map((role, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setSelectedRole(role);
                        setRoleSearchTerm("");
                        setShowRoleDropdown(false);
                      }}
                      className="px-4 py-3 hover:bg-slate-700 cursor-pointer text-white border-b border-slate-700 last:border-b-0 transition-colors"
                    >
                      {role}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-slate-400 italic">
                    No roles found matching "{roleSearchTerm}"
                  </div>
                )}
              </div>
            )}
            {selectedRole && (
              <div className="mt-2 flex items-center space-x-2">
                <div className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-medium">
                  Selected: {selectedRole}
                </div>
                <button
                  onClick={() => {
                    setSelectedRole("");
                    setRoleSearchTerm("");
                  }}
                  className="text-slate-400 hover:text-red-400 text-sm transition-colors"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5">
          <label className="block text-sm font-medium text-white mb-3">
            What is your experience level?
          </label>
          <div className="grid grid-cols-2 gap-4">
            {["Entry Level", "Mid Level", "Senior Level", "Executive Level"].map(
              (level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedLevel === level
                      ? "border-purple-500 bg-purple-600 text-white"
                      : "border-slate-600 bg-slate-700 text-slate-300 hover:border-purple-500 hover:bg-slate-600"
                  }`}
                >
                  {level}
                </button>
              )
            )}
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <ResumeParser onAnalysisComplete={onAnalysisComplete} />
        </div>

        <div className="mt-6 flex items-center space-x-2 p-4 bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg border border-slate-600">
          <input
            type="checkbox"
            id="includeCoding"
            checked={includeCoding}
            onChange={(e) => setIncludeCoding(e.target.checked)}
            className="w-4 h-4 text-purple-600 rounded border-slate-500 focus:ring-purple-500 bg-slate-700"
          />
          <label htmlFor="includeCoding" className="text-sm font-medium text-white">
            Include coding questions in the interview
          </label>
          <div className="ml-2 text-xs text-slate-400">
            (Will test practical coding skills during the interview)
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <Button
            onClick={onNext}
            disabled={!selectedRole || !selectedLevel || !resumeUploaded}
            className="bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </Button>
        </div>
        
        {(!selectedRole || !selectedLevel || !resumeUploaded) && (
          <div className="mt-2 text-center">
            <p className="text-sm text-slate-400">
              {!selectedRole && "Please select a role. "}
              {!selectedLevel && "Please select an experience level. "}
              {!resumeUploaded && "Please upload and parse your resume. "}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}