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
  setIncludeCoding,
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
    <Card className="border border-zinc-800 bg-zinc-950 shadow-[0_0_25px_-5px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_35px_-5px_rgba(59,130,246,0.4)]">
      <CardHeader className="text-center border-b border-zinc-900 py-8">
        <div className="w-20 h-20 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
          <Target className="w-10 h-10 text-blue-500" />
        </div>
        <CardTitle className="text-3xl font-bold text-zinc-50 tracking-tight">
          Setup Your AI Mock Interview
        </CardTitle>
        <p className="text-zinc-500 text-base mt-2">
          Choose your role and experience level
        </p>
      </CardHeader>

      <CardContent className="space-y-10 p-10">
        {/* Step 1: Role Selection */}
        <div>
          <label className="block text-sm font-semibold text-zinc-200 mb-3 flex items-center">
            <span className="bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm mr-3">
              1
            </span>
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
              className="w-full p-4 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />

            {showRoleDropdown && (roleSearchTerm || !selectedRole) && (
              <div className="absolute z-50 w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                {filteredRoles.length > 0 ? (
                  filteredRoles.map((role, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setSelectedRole(role);
                        setRoleSearchTerm("");
                        setShowRoleDropdown(false);
                      }}
                      className="px-5 py-3 hover:bg-zinc-800 cursor-pointer text-zinc-200 border-b border-zinc-800 last:border-b-0 transition-colors"
                    >
                      {role}
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-4 text-zinc-500 italic text-center">
                    No roles found matching "{roleSearchTerm}"
                  </div>
                )}
              </div>
            )}

            {selectedRole && (
              <div className="mt-3 flex items-center space-x-3">
                <div className="px-4 py-2 bg-zinc-900 text-blue-400 rounded-full text-sm font-medium">
                  Selected: {selectedRole}
                </div>
                <button
                  onClick={() => {
                    setSelectedRole("");
                    setRoleSearchTerm("");
                  }}
                  className="text-zinc-500 hover:text-red-400 text-sm font-medium transition-colors"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Experience Level */}
        <div>
          <label className="block text-sm font-semibold text-zinc-200 mb-3 flex items-center">
            <span className="bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm mr-3">
              2
            </span>
            What is your experience level?
          </label>

          <div className="grid grid-cols-2 gap-4">
            {["Entry Level", "Mid Level", "Senior Level", "Executive Level"].map(
              (level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`p-5 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                    selectedLevel === level
                      ? "border-blue-500 bg-zinc-900 text-zinc-50 shadow-md"
                      : "border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-blue-500 hover:text-zinc-200 hover:bg-zinc-900"
                  }`}
                >
                  {level}
                </button>
              )
            )}
          </div>
        </div>

        {/* Step 3: Resume Upload */}
        <div>
          <label className="block text-sm font-semibold text-zinc-200 mb-3 flex items-center">
            <span className="bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm mr-3">
              3
            </span>
            Upload Your Resume
          </label>
          <div className="mt-4">
            <ResumeParser onAnalysisComplete={onAnalysisComplete} />
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-end mt-10 pt-6 border-t border-zinc-900">
          <Button
            onClick={onNext}
            disabled={!selectedRole || !selectedLevel || !resumeUploaded}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 text-lg font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
          >
            Continue
          </Button>
        </div>

        {/* Validation Message */}
        {(!selectedRole || !selectedLevel || !resumeUploaded) && (
          <div className="mt-2 bg-zinc-950 border border-zinc-900 rounded-lg p-4">
            <p className="text-sm text-zinc-500 text-center font-medium">
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