import React, { useState, useRef, useEffect } from "react";
import { Brain, ArrowLeft, Camera, Video, VideoOff, Send, Mic, MicOff, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

import { askAzureText, askAzureWithImage } from "../Utils/Feedback";
import InterviewResults from "./InterviewResults";
import InterviewSetupStep1 from "./InterviewSetupStep1";
import InterviewSetupStep2 from "./InterviewSetupStep2";
import InterviewSetupStep3 from "./InterviewSetupStep3";
import InterviewHeader from "./InterviewHeader";
import ProgressPanel from "./ProgressPanel";
import { Button } from "./button";
import { Card, CardHeader, CardTitle, CardContent } from "./card";
import { Textarea } from "./textarea";
import AiInterviewer from "./talkingHead/AiInterviewer";
import { useAuth0 } from "@auth0/auth0-react";

const allRoles = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Mobile App Developer",
  "Game Developer",
  "DevOps Engineer",
  "Site Reliability Engineer (SRE)",
  "Software Architect",
  "Technical Lead",
  "Data Scientist",
  "Data Engineer",
  "Data Analyst",
  "Machine Learning Engineer",
  "AI Engineer",
  "Business Intelligence Analyst",
  "Cloud Engineer",
  "Cloud Architect",
  "AWS Solutions Architect",
  "Azure Solutions Architect",
  "Systems Administrator",
  "Network Engineer",
  "Infrastructure Engineer",
  "Cybersecurity Analyst",
  "Security Engineer",
  "Penetration Tester",
  "Information Security Manager",
  "QA Engineer",
  "Test Automation Engineer",
  "Performance Test Engineer",
  "UX/UI Designer",
  "UX Designer",
  "UI Designer",
  "Product Designer",
  "Product Manager",
  "Technical Product Manager",
  "Project Manager",
  "Scrum Master",
  "Agile Coach",
  "Business Analyst",
  "Systems Analyst",
  "IT Business Analyst",
  "Database Administrator (DBA)",
  "Database Developer",
  "API Developer",
  "Technical Sales Engineer",
  "Solutions Engineer",
  "Marketing Manager",
  "Sales Representative",
  "Management Consultant",
  "IT Consultant",
  "Technology Consultant",
  "Engineering Manager",
  "Chief Technology Officer (CTO)",
  "IT Director",
];

export default function Mentor() {
  const [isStarted, setIsStarted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [messages, setMessages] = useState([]);
  const [warningCount, setWarningCount] = useState(0);
  const [lastWarningTime, setLastWarningTime] = useState(null);
  const [includeCoding, setIncludeCoding] = useState(false);
  const [currentCodingQuestion, setCurrentCodingQuestion] = useState(null);
  const [currentInput, setCurrentInput] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [roleSearchTerm, setRoleSearchTerm] = useState("");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const { user } = useAuth0();
  const [timer, setTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [userResponses, setUserResponses] = useState([]);
  const [aiFeedback, setAiFeedback] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [setupStep, setSetupStep] = useState(1);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  
  // State for background photo analysis
  const [backgroundAnalyses, setBackgroundAnalyses] = useState([]);
  const [captureCount, setCaptureCount] = useState(0);
  
  // NEW: Conversation history for context window
  const [conversationHistory, setConversationHistory] = useState([]);

  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const aiInterviewerRef = useRef(null);
  const captureIntervalRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isStarted && interviewQuestions.length > 0) {
      const minutes = 15;
      setTimer(minutes * 60);
      setTimeLeft(minutes * 60);
    }
  }, [isStarted, interviewQuestions.length]);

  useEffect(() => {
    if (!isStarted || isComplete || timeLeft === null) return;
    if (timeLeft <= 0) {
      setIsComplete(true);
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isStarted, isComplete, timeLeft]);

  useEffect(() => {
    if (isStarted && !isComplete && isCameraOn) {
      startBackgroundCapture();
    } else {
      stopBackgroundCapture();
    }
    
    return () => {
      stopBackgroundCapture();
    };
  }, [isStarted, isComplete, isCameraOn]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOn(true);

        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch((err) => {
            console.error("Play error:", err);
          });
        };
      }
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Unable to access camera. Please check permissions and try again.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  };

  const captureImage = () => {
    if (!videoRef.current || !isCameraOn) {
      console.log("❌ captureImage: No video or camera off");
      return null;
    }

    const video = videoRef.current;
    
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.log("❌ captureImage: Video has no dimensions");
      return null;
    }

    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.log("❌ captureImage: Could not get canvas context");
        return null;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      
      console.log(`✅ captureImage: Captured ${canvas.width}x${canvas.height}, data length: ${dataUrl.length}`);
      return dataUrl;
    } catch (error) {
      console.error("❌ captureImage error:", error);
      return null;
    }
  };

  const startBackgroundCapture = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
    }

    console.log("🎬 Starting background photo capture every 15 seconds");

    captureAndAnalyzeBackground();

    captureIntervalRef.current = setInterval(() => {
      captureAndAnalyzeBackground();
    }, 15000);
  };

  const stopBackgroundCapture = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
      console.log("🛑 Stopped background photo capture");
    }
  };

  const captureAndAnalyzeBackground = async () => {
    try {
      if (!videoRef.current || !isCameraOn) {
        console.log("⚠️ Camera not available");
        return;
      }

      if (videoRef.current.readyState < 2) {
        console.log("⚠️ Video not ready yet (readyState:", videoRef.current.readyState + ")");
        return;
      }

      if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
        console.log("⚠️ Video has no dimensions");
        return;
      }

      const timestamp = new Date();
      const newCaptureCount = captureCount + 1;
      setCaptureCount(newCaptureCount);

      console.log(`📸 Background Capture #${newCaptureCount} at ${timestamp.toLocaleTimeString()}`);

      const imageData = captureImage();
      if (!imageData || imageData.length < 1000) {
        console.log("⚠️ Failed to capture valid image data");
        return;
      }

      console.log(`✅ Image captured successfully (${imageData.length} bytes)`);

      analyzeImageInBackground(imageData, newCaptureCount, timestamp);

    } catch (error) {
      console.error("❌ Error during background capture:", error);
    }
  };

  const analyzeImageInBackground = async (imageData, captureNum, timestamp) => {
    try {
      console.log(`🔍 Starting analysis for capture #${captureNum}...`);

      const analysis = await askAzureWithImage(
        `Analyze this candidate's appearance and demeanor during the interview. Provide brief feedback on:
1. Professional appearance and body language
2. Posture and positioning
3. Eye contact and engagement level
4. Overall confidence and professionalism

Be constructive and professional. Keep it concise (2-3 sentences). Please provide a clean response without any markdown formatting like ** or *.`,
        imageData
      );

      const cleanAnalysis = analysis
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1");

      const analysisRecord = {
        id: `capture_${captureNum}_${Date.now()}`,
        captureNumber: captureNum,
        timestamp: timestamp,
        analysis: cleanAnalysis,
        questionNumber: currentQuestion + 1,
        currentQuestion: interviewQuestions[currentQuestion] || "N/A",
      };

      setBackgroundAnalyses((prev) => {
        const updated = [...prev, analysisRecord];
        console.log(`✅ Analysis #${captureNum} complete. Total analyses: ${updated.length}`);
        console.log(`📊 Analysis result:`, cleanAnalysis);
        return updated;
      });

    } catch (error) {
      console.error(`❌ Error analyzing capture #${captureNum}:`, error);
      console.error("Full error:", error.message, error.stack);
      
      setBackgroundAnalyses((prev) => [
        ...prev,
        {
          id: `capture_${captureNum}_${Date.now()}`,
          captureNumber: captureNum,
          timestamp: timestamp,
          analysis: `Analysis failed: ${error.message}`,
          error: true,
          errorMessage: error.message,
          questionNumber: currentQuestion + 1,
        },
      ]);
    }
  };

  const generateCodingQuestion = async () => {
    const prompt = `Generate a coding problem suitable for a ${selectedLevel} ${selectedRole} position. 
    Format the response as a JSON object with these fields:
    {
      "title": "Problem title",
      "description": "Detailed problem description",
      "examples": "Input/output examples",
      "testCases": [
        {"input": "test input", "expected": "expected output"}
      ],
      "template": "Starting code template",
      "difficulty": "easy/medium/hard"
    }`;

    try {
      const response = await askAzureText(prompt);
      const codingQuestion = JSON.parse(response);
      localStorage.setItem('currentQuestion', JSON.stringify(codingQuestion));
      return codingQuestion;
    } catch (error) {
      console.error('Error generating coding question:', error);
      return null;
    }
  };

  const generateInterviewQuestions = async (
    role,
    level,
    numQuestions = 10,
    resumeData = null
  ) => {
    try {
      let candidateInfo = "";
      if (resumeData) {
        candidateInfo = `
Candidate Information:
- Name: ${resumeData.name || "Not provided"}
- Skills: ${resumeData.skills?.join(", ") || "Not provided"}
- Experience: ${
          resumeData.experience
            ?.map(
              (exp) =>
                `\n  * ${exp.title} at ${exp.company} (${exp.duration})`
            )
            .join("") || "Not provided"
        }
- Projects: ${
          resumeData.projects
            ?.map((proj) => `\n  * ${proj.name}: ${proj.description}`)
            .join("") || "Not provided"
        }`;
      }

      const prompt = `You are an experienced HR interviewer. Generate exactly ${numQuestions} interview questions for a ${level} level ${role} position. 

${
  candidateInfo
    ? `Using the candidate's background:${candidateInfo}

Based on their experience and skills, tailor some questions to:
- Verify their claimed experience and skills
- Dive deeper into their listed projects
- Explore how their background aligns with the role
- Challenge them on relevant technical concepts

`
    : ""
}Make the questions:
- Realistic and relevant to the role
- Appropriate for the experience level
- Professional and clear
- Varied in type (behavioral, technical, situational)

For ${level} level positions:
- Entry Level: Focus on basic knowledge, learning ability, motivation, and potential
- Mid Level: Include technical skills, problem-solving, past experience, and teamwork
- Senior Level: Cover leadership, architecture, mentoring, and strategic thinking  
- Executive Level: Focus on vision, leadership, business impact, and strategic planning

Return ONLY the questions, each on a new line, without numbers or bullet points.

Role: ${role}
Experience Level: ${level}`;

      const response = await askAzureText(prompt);

      const questions = response
        .split("\n")
        .map((q) => q.trim())
        .filter((q) => q.length > 0 && q.includes("?"))
        .slice(0, numQuestions);

      if (questions.length >= 3) {
        return questions;
      }

      return questions.length > 0
        ? questions
        : [
            "Tell me about yourself and your background.",
            "Why are you interested in this position?",
            "What are your greatest strengths?",
            "Describe a challenging situation you faced and how you handled it.",
            "Where do you see yourself in 5 years?",
            "Do you have any questions for me?",
          ];
    } catch (error) {
      console.error("Error generating questions:", error);
      return [
        "Tell me about yourself and your background.",
        "Why are you interested in this position?",
        "What are your greatest strengths?",
        "Describe a challenging situation you faced and how you handled it.",
        "Where do you see yourself in 5 years?",
        "Do you have any questions for me?",
      ];
    }
  };

  const startInterview = async () => {
    if (!selectedRole || !selectedLevel) return;

    setIsLoading(true);
    const savedResumeData = localStorage.getItem("resumeAnalysis");
    const resumeData = savedResumeData ? JSON.parse(savedResumeData) : null;

    const questions = await generateInterviewQuestions(
      selectedRole,
      selectedLevel,
      10,
      resumeData
    );

    // If coding questions are included, generate one and insert it in the middle of the interview
    if (includeCoding) {
      const codingQuestion = await generateCodingQuestion();
      if (codingQuestion) {
        // Insert coding question in the middle of regular questions
        const midPoint = Math.floor(questions.length / 2);
        questions.splice(midPoint, 0, "Now, I'd like you to solve a coding problem. Please switch to the code editor tab. After you submit your solution, we'll discuss your approach and thought process.");
        setCurrentCodingQuestion(codingQuestion);
      }
    }
    
    setInterviewQuestions(questions);
    setIsStarted(true);
    
    // Initialize conversation history with system context
    const systemContext = `You are an experienced professional interviewer conducting a ${selectedLevel} level ${selectedRole} interview. Your role is to:
- Ask thoughtful follow-up questions based on candidate responses
- Provide constructive feedback when responses are weak or incomplete
- Challenge candidates when their answers are lazy or lack depth
- Encourage elaboration and specific examples
- Maintain a professional but conversational tone
- Guide the interview naturally, deciding when to move to the next question
- React authentically to responses - if something is vague, call it out; if it's impressive, acknowledge it.
- Dont go too deep into a single question/topic. Once its answered sufficiently, move on to the next question.

Interview has ${questions.length} questions total.${resumeData ? `\n\nCandidate Background:\n- Skills: ${resumeData.skills?.join(", ")}\n- Experience: ${resumeData.experience?.map(e => e.title).join(", ")}` : ""}`;

    setConversationHistory([
      { role: "system", content: systemContext }
    ]);
    
    const welcomeMessage = {
      id: Date.now().toString(),
      type: "bot",
      content: `Hello. I'm your interviewer for a ${selectedLevel} level ${selectedRole} position. We'll have ${questions.length} questions tailored to your background. Let's begin with: ${questions[0]}`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    setIsLoading(false);

    setTimeout(() => {
      if (aiInterviewerRef.current && questions[0]) {
        aiInterviewerRef.current.speakText(questions[0]);
      }
    }, 1000);
  };

  const handleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    if (isListening) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      recognitionRef.current = recognition;
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setCurrentInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      if (event.error !== "aborted") {
        console.error("Voice error:", event.error);
        alert("Voice error: " + event.error);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
  };

  const sendMessage = async () => {
    if (!currentInput.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: "user",
      content: currentInput,
      question: interviewQuestions[currentQuestion],
      timestamp: new Date(),
    };

    setUserResponses((prev) => [...prev, userMessage]);
    setMessages((prev) => [...prev, userMessage]);
    
    // Add user message to conversation history
    const updatedHistory = [
      ...conversationHistory,
      { 
        role: "user", 
        content: `Question ${currentQuestion + 1}/${interviewQuestions.length}: "${interviewQuestions[currentQuestion]}"\n\nCandidate's Answer: "${currentInput}"`
      }
    ];
    
    setCurrentInput("");
    setIsLoading(true);

    try {
      // First, analyze response for abusive or uncooperative behavior
      const behaviorCheckPrompt = `As an experienced interviewer, analyze this response for inappropriate behavior:
Question: "${interviewQuestions[currentQuestion]}"
Candidate's Answer: "${currentInput}"

Detect ONLY clear instances of:
1. Abusive language, profanity, or hostile behavior
2. Complete refusal to engage or answer questions
3. Deliberately inappropriate or offensive content

Respond with ONLY one of these exact words:
- "TERMINATE" if behavior is clearly abusive/inappropriate
- "WARNING" if behavior is concerning but not severe
- "ACCEPTABLE" if behavior is professional

Response:`;

      const behaviorCheck = await askAzureText(behaviorCheckPrompt);
      
      if (behaviorCheck.trim() === "TERMINATE") {
        // End interview due to inappropriate behavior
        const terminationMessage = {
          id: Date.now().toString(),
          type: "assistant",
          content: "I'm going to have to end this interview due to inappropriate behavior or language. Professional conduct is a requirement for this interview process. The session will now end.",
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, terminationMessage]);
        setIsComplete(true);
        setShowResults(true);
        return;
      } else if (behaviorCheck.trim() === "WARNING") {
        // Check if we should issue a warning
        const currentTime = new Date();
        const warningCooldown = 2 * 60 * 1000; // 2 minutes cooldown between warnings
        
        if (!lastWarningTime || (currentTime - lastWarningTime) > warningCooldown) {
          setWarningCount(prev => prev + 1);
          setLastWarningTime(currentTime);
          
          // If this is the third warning, end the interview
          if (warningCount >= 2) {
            const terminationMessage = {
              id: Date.now().toString(),
              type: "assistant",
              content: "I've had to issue multiple warnings about professional conduct. As this behavior has continued, I'll have to end our interview here. Thank you for your time.",
              timestamp: new Date(),
            };
            
            setMessages(prev => [...prev, terminationMessage]);
            setIsComplete(true);
            setShowResults(true);
            return;
          }
          
          // Issue a warning message
          const warningMessage = {
            id: Date.now().toString(),
            type: "assistant",
            content: `I need to pause here and remind you about maintaining professional conduct during this interview. ${
              warningCount === 0 
                ? "This is a friendly reminder to engage constructively with the questions."
                : "This is your second warning. A third instance will end the interview."
            } Let's continue with your response to the question.`,
            timestamp: new Date(),
          };
          
          setMessages(prev => [...prev, warningMessage]);
        }
      }

      // Continue with normal interview if behavior is acceptable
      // Build context-aware prompt
      const interviewContext = `Current Question: ${currentQuestion + 1} of ${interviewQuestions.length}
Remaining Questions: ${interviewQuestions.slice(currentQuestion + 1).join("\n")}

As an experienced interviewer, analyze the candidate's response and decide how to proceed:

1. If the answer is weak, lazy, incomplete, or lacks depth or isnt related to topic raised:
   - Provide small constructive criticism 
   - Ask them to elaborate with specific examples
   - Challenge vague statements
   - Example: "That's quite general. Can you walk me through a specific situation where you demonstrated this?"

2. If the answer is vague or surface-level:
   - Ask probing follow-up questions
   - Request concrete details, metrics, or outcomes
   - Example: "You mentioned working on projects - can you describe one in detail? What was your specific role and what technologies did you use?"

3. If the answer is good but could be deeper:
   - Acknowledge what's strong
   - Gently push for more depth on interesting points
   - Example: "That's a solid approach. I'm curious about how you handled [specific aspect]?"

4. If the answer is strong and complete:
   - Provide brief positive acknowledgment
   - Naturally transition to the next question
   - Example: "Excellent answer. I appreciate the specific examples you provided. Let's move on..."

Be conversational and natural. React authentically. Your response should feel like a real interviewer, not scripted.

${currentQuestion < interviewQuestions.length - 1 ? 
  `When you decide the candidate has sufficiently answered, naturally transition by asking: "${interviewQuestions[currentQuestion + 1]}"` : 
  "This is the final question. Provide concluding feedback and thank them for their time."}

Respond naturally without markdown formatting.
Dont give very long responses.`;

      const fullPrompt = `${updatedHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n\n')}\n\n${interviewContext}`;

      // Get AI response with full context
      const aiResponse = await askAzureText(fullPrompt);

      const cleanResponse = aiResponse
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .trim();

      // Update conversation history with AI response
      setConversationHistory([
        ...updatedHistory,
        { role: "assistant", content: cleanResponse }
      ]);

      // Store feedback
      setAiFeedback((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          questionNumber: currentQuestion + 1,
          question: interviewQuestions[currentQuestion],
          userAnswer: userMessage.content,
          feedback: cleanResponse,
          timestamp: new Date(),
          isFinal: currentQuestion === interviewQuestions.length - 1,
        },
      ]);

      // Check if AI decided to move to next question (by including the next question text)
      const shouldMoveToNext = currentQuestion < interviewQuestions.length - 1 && 
        cleanResponse.toLowerCase().includes(interviewQuestions[currentQuestion + 1].toLowerCase().substring(0, 30));

      if (shouldMoveToNext) {
        setCurrentQuestion((prev) => prev + 1);
      }

      // Handle interview completion
      if (currentQuestion === interviewQuestions.length - 1) {
        setIsComplete(true);
        setTimeout(() => {
          setShowResults(true);
        }, 2000);
      }

      const botMessage = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: cleanResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);

      // Trigger AI to speak response
      if (aiInterviewerRef.current) {
        setTimeout(() => {
          aiInterviewerRef.current.speakText(cleanResponse);
        }, 500);
      }

    } catch (error) {
      console.error("Error generating response:", error);
      
      const fallbackResponse = currentQuestion < interviewQuestions.length - 1
        ? `Thank you for that response. Let me ask you the next question: ${interviewQuestions[currentQuestion + 1]}`
        : "Thank you for completing the interview! That concludes our session.";

      if (currentQuestion < interviewQuestions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        setIsComplete(true);
      }

      const botMessage = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: fallbackResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetInterview = () => {
    stopBackgroundCapture();
    setIsStarted(false);
    setMessages([]);
    setCurrentQuestion(0);
    setIsComplete(false);
    setCurrentInput("");
    setInterviewQuestions([]);
    setUserResponses([]);
    setAiFeedback([]);
    setShowResults(false);
    setBackgroundAnalyses([]);
    setCaptureCount(0);
    setConversationHistory([]);
  };

  const handleResumeAnalysis = (analysisData) => {
    setResumeUploaded(true);
    startInterview();
  };

  if (showResults) {
    return (
      <InterviewResults
        selectedRole={selectedRole}
        selectedLevel={selectedLevel}
        interviewQuestions={interviewQuestions}
        userResponses={userResponses}
        aiFeedback={aiFeedback}
        timer={timer}
        timeLeft={timeLeft}
        onStartNewInterview={resetInterview}
        backgroundAnalyses={backgroundAnalyses}
      />
    );
  }

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-teal-50 to-slate-50">
        <header className="border-b border-slate-200/60 bg-white/90 backdrop-blur-md shadow-sm relative">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between relative">
            <Link
              to="/"
              className="flex items-center space-x-2 text-slate-600 hover:text-purple-700 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Home</span>
            </Link>

            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-teal-600 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-center text-xl font-bold text-slate-900">
                AI Interview Setup
              </h1>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            {setupStep === 1 && (
              <InterviewSetupStep1
                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole}
                selectedLevel={selectedLevel}
                setSelectedLevel={setSelectedLevel}
                roleSearchTerm={roleSearchTerm}
                setRoleSearchTerm={setRoleSearchTerm}
                showRoleDropdown={showRoleDropdown}
                setShowRoleDropdown={setShowRoleDropdown}
                allRoles={allRoles}
                onNext={() => setSetupStep(2)}
                onAnalysisComplete={handleResumeAnalysis}
                resumeUploaded={resumeUploaded}
              />
            )}

            {setupStep === 2 && (
              <InterviewSetupStep2
                onBack={() => setSetupStep(1)}
                onNext={startInterview}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-teal-50 to-slate-50">
      <InterviewHeader
        isStarted={isStarted}
        selectedRole={selectedRole}
        selectedLevel={selectedLevel}
        isCameraOn={isCameraOn}
        timeLeft={timeLeft}
        user={user}
        onReset={resetInterview}
      />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="border-slate-200 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-teal-50 border-b border-slate-100">
              <CardTitle className="text-lg text-slate-900 flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-600" />
                <span>AI Interviewer</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div style={{ width: '100%', height: '450px', position: 'relative' }}>
                <AiInterviewer 
                  ref={aiInterviewerRef}
                  currentQuestion={interviewQuestions[currentQuestion]}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100">
              <CardTitle className="text-lg text-slate-900 flex items-center space-x-2">
                <Camera className="w-5 h-5 text-blue-600" />
                <span>Your Video</span>
                {isStarted && !isComplete && isCameraOn && (
                  <span className="ml-auto text-xs text-green-600 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                    Captures: {captureCount} | Analyses: {backgroundAnalyses.length}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-[400px] rounded-lg border border-slate-200 bg-slate-100 object-cover"
              />
              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-slate-500">
                  Auto-captured every 15s for analysis
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isCameraOn ? stopCamera : startCamera}
                  className={`transition-all duration-300 ${
                    isCameraOn
                      ? "border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                      : "border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {isCameraOn ? (
                    <>
                      <VideoOff className="w-4 h-4 mr-1" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4 mr-1" />
                      Start
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-200 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-teal-50 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-teal-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-lg text-slate-900">
                  Your Answer
                </CardTitle>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-slate-600">
                  Question {currentQuestion + 1} of {interviewQuestions.length}
                </div>
                <ProgressPanel
                  completedQuestions={userResponses.length}
                  totalQuestions={interviewQuestions.length}
                  compact={true}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-4 max-h-[200px] overflow-y-auto space-y-3 p-4 bg-slate-50 rounded-lg">
              {messages.slice(-3).map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg shadow-sm text-sm ${
                      message.type === "user"
                        ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white"
                        : "bg-white border border-slate-200 text-slate-900"
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <Brain className="w-4 h-4 text-purple-600 animate-pulse" />
                      <span className="text-sm text-slate-600">
                        AI is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!isComplete && (
              <div className="space-y-3">
                <div className="flex space-x-3">
                  <Textarea
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    placeholder="Type your response here or use voice input..."
                    className="flex-1 min-h-[100px] border-slate-300 focus:border-purple-500 focus:ring-purple-500/20 bg-white"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <div className="flex flex-col space-y-2">
                    <Button
                      onClick={sendMessage}
                      disabled={!currentInput.trim() || isLoading}
                      className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-12 w-12"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                    {!isListening ? (
                      <Button
                        onClick={handleVoiceInput}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-12 w-12"
                      >
                        <Mic className="w-5 h-5" />
                      </Button>
                    ) : (
                      <Button
                        onClick={stopListening}
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-12 w-12 animate-pulse"
                      >
                        <MicOff className="w-5 h-5" />
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        setIsComplete(true);
                        setShowResults(true);
                      }}
                      variant="outline"
                      className="text-slate-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-all duration-300 h-12 w-12"
                      title="Finish Interview"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                {isListening && (
                  <div className="text-sm text-red-600 animate-pulse text-center font-medium">
                    🎤 Listening... Speak your answer now
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}