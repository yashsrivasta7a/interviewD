import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";

export default function CodeEditor() {
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(`// Write your code here
#include <bits/stdc++.h>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b;
    return 0;
}`);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const [testCases, setTestCases] = useState([
    { input: "2 3", expected: "5" },
    { input: "10 20", expected: "30" },
  ]);

  const languageMap = {
    cpp: 54,
    python: 71,
    javascript: 63,
  };

  const handleRunTests = async () => {
    setLoading(true);
    setOutput("Running test cases...");
    const results = [];

    for (const test of testCases) {
      try {
        const response = await axios.post(
          "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
          {
            source_code: code,
            language_id: languageMap[language],
            stdin: test.input,
          },
          {
            headers: {
              "content-type": "application/json",
              "X-RapidAPI-Key": "0d0b1bd553msh0688debb2ca79e8p1703adjsn61fbd0f113ab", // 👈 Replace with your key
              "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            },
          }
        );

        const result = response.data;
        const actual = result.stdout ? result.stdout.trim() : "Error";
        results.push({
          input: test.input,
          expected: test.expected,
          output: actual,
          passed: actual === test.expected,
        });
      } catch (error) {
        results.push({
          input: test.input,
          expected: test.expected,
          output: "Execution failed",
          passed: false,
        });
      }
    }

    const formatted = results
      .map(
        (r, i) =>
          `#${i + 1}\nInput: ${r.input}\nExpected: ${r.expected}\nOutput: ${r.output}\nResult: ${
            r.passed ? "✅ Passed" : "❌ Failed"
          }\n`
      )
      .join("\n");

    setOutput(formatted);
    setLoading(false);
  };

  return (
    <div className="p-6 bg-gray-950 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-4 text-center">⚡ Online Coding UI</h1>

      {/* Controls */}
      <div className="flex gap-3 mb-4 justify-center">
        <select
          className="p-2 rounded bg-gray-800 border border-gray-700"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="cpp">C++</option>
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
        </select>

        <button
          onClick={handleRunTests}
          className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
          disabled={loading}
        >
          {loading ? "Running..." : "Run Test Cases"}
        </button>
      </div>

      {/* Code Editor */}
      <Editor
        height="400px"
        theme="vs-dark"
        language={language}
        value={code}
        onChange={(value) => setCode(value)}
      />

      {/* Output */}
      <div className="mt-4 bg-gray-900 p-4 rounded-lg border border-gray-700">
        <h2 className="text-lg font-semibold mb-2">Output</h2>
        <pre className="whitespace-pre-wrap">{output}</pre>
      </div>
    </div>
  );
}
