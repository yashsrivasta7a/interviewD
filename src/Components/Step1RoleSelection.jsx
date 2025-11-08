import React, { useRef } from 'react';
import { Button } from './button';

export default function Step1RoleSelection({ 
  selectedRole, 
  setSelectedRole,
  selectedLevel,
  setSelectedLevel,
  roleSearchTerm,
  setRoleSearchTerm,
  showRoleDropdown,
  setShowRoleDropdown,
  allRoles,
  onContinue
}) {
  const roleDropdownRef = useRef(null);
  
  const filteredRoles = allRoles.filter((role) =>
    role.toLowerCase().includes(roleSearchTerm.toLowerCase())
  );

  return (
    <>
      <div className="mt-5">
        <label className="block text-sm font-medium text-slate-900 mb-3">
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
            className="w-full p-3 rounded border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          {showRoleDropdown && (roleSearchTerm || !selectedRole) && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredRoles.length > 0 ? (
                filteredRoles.map((role, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedRole(role);
                      setRoleSearchTerm("");
                      setShowRoleDropdown(false);
                    }}
                    className="px-4 py-3 hover:bg-purple-50 cursor-pointer text-slate-900 border-b border-slate-100 last:border-b-0"
                  >
                    {role}
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-slate-500 italic">
                  No roles found matching "{roleSearchTerm}"
                </div>
              )}
            </div>
          )}
          {selectedRole && (
            <div className="mt-2 flex items-center space-x-2">
              <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                Selected: {selectedRole}
              </div>
              <button
                onClick={() => {
                  setSelectedRole("");
                  setRoleSearchTerm("");
                }}
                className="text-slate-500 hover:text-red-500 text-sm"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5">
        <label className="block text-sm font-medium text-slate-900 mb-3">
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
                    ? "border-purple-600 bg-purple-50 text-purple-700"
                    : "border-slate-200 hover:border-purple-300 hover:bg-purple-50/50"
                }`}
              >
                {level}
              </button>
            )
          )}
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <Button
          onClick={onContinue}
          disabled={!selectedRole || !selectedLevel}
          className="bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white"
        >
          Continue
        </Button>
      </div>
    </>
  );
}