import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

export default function CodeEditor() {
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState(null);
  const [feedback, setFeedback] = useState("");

  const [testCases] = useState([
    { input: "2 3", expected: "5" },
    { input: "10 20", expected: "30" },
  ]);

  const languageMap = {
    cpp: 54,
    python: 71,
    javascript: 63,
  };

  useEffect(() => {
    // Load question from localStorage when component mounts
    const savedQuestion = localStorage.getItem('currentQuestion');
    if (savedQuestion) {
      const parsedQuestion = JSON.parse(savedQuestion);
      setQuestion(parsedQuestion);
      setCode(getInitialCode(parsedQuestion.template, language));
    }
  }, [language]);

  const getInitialCode = (template, lang) => {
    const templates = {
      cpp: `// ${question?.title || 'Loading...'}\n// ${question?.description || ''}\n\n${template || ''}`,
      python: `# ${question?.title || 'Loading...'}\n# ${question?.description || ''}\n\n${template || ''}`,
      javascript: `// ${question?.title || 'Loading...'}\n// ${question?.description || ''}\n\n${template || ''}`
    };
    return templates[lang] || templates.cpp;
  };

  const evaluateWithAI = async (code, results) => {
    try {
      const response = await fetch('/api/azure-openai/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          testResults: results,
          question
        })
      });

      if (!response.ok) throw new Error('Failed to get AI evaluation');
      
      const evaluation = await response.json();
      setFeedback(evaluation.feedback);
      return evaluation;
    } catch (error) {
      console.error('AI Evaluation Error:', error);
      setFeedback("Failed to get AI evaluation");
    }
  };

  const handleRunTests = async () => {
    setLoading(true);
    setOutput("Running test cases...");
    const results = [];

    for (const test of (question?.testCases || testCases)) {
      try {
        const response = await fetch(
          "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "X-RapidAPI-Key": "0d0b1bd553msh0688debb2ca79e8p1703adjsn61fbd0f113ab",
              "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            },
            body: JSON.stringify({
              source_code: code,
              language_id: languageMap[language],
              stdin: test.input,
            }),
          }
        );

        const result = await response.json();
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
          `Test ${i + 1}\nInput: ${r.input}\nExpected: ${r.expected}\nOutput: ${r.output}\nResult: ${
            r.passed ? "PASSED" : "FAILED"
          }\n`
      )
      .join("\n");

    setOutput(formatted);

    // Get AI evaluation of the code
    await evaluateWithAI(code, results);
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-light tracking-tight">Code Editor</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Controls Bar */}
          <div className="flex items-center justify-between">
            <select
              className="px-4 py-2.5 bg-white text-black font-medium tracking-wide text-sm border-2 border-white hover:bg-black hover:text-white transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="cpp">C++</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
            </select>

            <button
              onClick={handleRunTests}
              className="px-6 py-2.5 bg-white text-black font-medium tracking-wide text-sm border-2 border-white hover:bg-black hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
              disabled={loading}
            >
              {loading ? "RUNNING..." : "RUN TESTS"}
            </button>
          </div>

          {/* Editor Container */}
          <div className="border-2 border-white/20 overflow-hidden">
            <Editor
              height="500px"
              theme="vs-dark"
              language={language}
              value={code}
              onChange={(value) => setCode(value)}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              }}
            />
          </div>

          {/* Question Section */}
          {question && (
            <div className="border-2 border-white/20 bg-black mb-6">
              <div className="border-b border-white/10 px-6 py-4">
                <h2 className="text-xl font-medium">{question.title}</h2>
              </div>
              <div className="px-6 py-6">
                <p className="text-white/90 whitespace-pre-wrap">{question.description}</p>
                {question.examples && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Examples:</h3>
                    <pre className="bg-white/5 p-4 rounded">{question.examples}</pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Output Section */}
          <div className="border-2 border-white/20 bg-black">
            <div className="border-b border-white/10 px-6 py-4">
              <h2 className="text-sm font-medium tracking-widest uppercase">Output</h2>
            </div>
            <div className="px-6 py-6">
              {output ? (
                <pre className="font-mono text-sm leading-relaxed text-white/90 whitespace-pre-wrap">
                  {output}
                </pre>
              ) : (
                <p className="text-white/40 text-sm">Run test cases to see output</p>
              )}
            </div>
          </div>

          {/* AI Feedback Section */}
          {feedback && (
            <div className="border-2 border-white/20 bg-black mt-6">
              <div className="border-b border-white/10 px-6 py-4">
                <h2 className="text-sm font-medium tracking-widest uppercase">AI Feedback</h2>
              </div>
              <div className="px-6 py-6">
                <div className="text-white/90 whitespace-pre-wrap">{feedback}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs text-white/40 tracking-wider">POWERED BY JUDGE0</p>
        </div>
      </div>
    </div>
  );
}