import React, { useState, useRef, useEffect } from "react";
import { Brain, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { askAzureText, askAzureWithImage } from "../Utils/azureOpenAi";
import InterviewResults from "./InterviewResults";
import InterviewSetupStep1 from "./InterviewSetupStep1";
import InterviewSetupStep2 from "./InterviewSetupStep2";
import InterviewSetupStep3 from "./InterviewSetupStep3";
import InterviewHeader from "./InterviewHeader";
import VideoFeedPanel from "./VideoFeedPanel";
import ChatPanel from "./ChatPanel";
import ProgressPanel from "./ProgressPanel";
import InterviewTipsPanel from "./InterviewTipsPanel";

const nextQuestionStarters = [
  "Alright, here's the next one:",
  "Let's keep going — next question:",
  "Great! Moving on:",
  "Nice response. Try this next one:",
  "Okay, here's another question for you:",
  "You're doing well — answer this:",
  "Let's continue — next up:",
  "Cool, now think about this one:",
  "Appreciate the answer! Next question:",
  "Great insight — try this next:",
  "Awesome — here's the next question:",
];

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

  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
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
    if (!videoRef.current || !isCameraOn) return null;

    const canvas = document.createElement("canvas");
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg");
    }
    return null;
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

    setInterviewQuestions(questions);
    setIsStarted(true);
    const welcomeMessage = {
      id: Date.now().toString(),
      type: "bot",
      content: `Hello. I'm your interviewer for a ${selectedLevel} level ${selectedRole} position. We'll have ${questions.length} questions tailored to your background. Let's begin with: ${questions[0]}`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    setIsLoading(false);
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
    setCurrentInput("");
    setIsLoading(true);

    try {
      let botResponse = "";
      let nextQuestionOnly = "";

      if (currentQuestion < interviewQuestions.length - 1) {
        const feedbackPrompt = `As an experienced interviewer, provide brief constructive feedback (2-3 sentences) on this candidate's response to the question "${interviewQuestions[currentQuestion]}": "${userMessage.content}". Please provide a clean response without any markdown formatting like ** or *.`;

        botResponse = await askAzureText(feedbackPrompt);
        botResponse = botResponse
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/\*(.*?)\*/g, "$1");

        setAiFeedback((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            questionNumber: currentQuestion + 1,
            question: interviewQuestions[currentQuestion],
            userAnswer: userMessage.content,
            feedback: botResponse,
            timestamp: new Date(),
          },
        ]);

        setCurrentQuestion((prev) => prev + 1);
        const starter =
          nextQuestionStarters[
            Math.floor(Math.random() * nextQuestionStarters.length)
          ];

        nextQuestionOnly = `${starter} ${
          interviewQuestions[currentQuestion + 1]
        }`;
      } else {
        const finalFeedbackPrompt = `As an experienced interviewer, provide a brief final assessment (3-4 sentences) of this candidate's overall interview performance based on their responses. Be constructive and encouraging. Please provide a clean response without any markdown formatting like ** or *.`;

        botResponse = await askAzureText(finalFeedbackPrompt);
        botResponse = botResponse
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/\*(.*?)\*/g, "$1");

        setAiFeedback((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            questionNumber: currentQuestion + 1,
            question: interviewQuestions[currentQuestion],
            userAnswer: userMessage.content,
            feedback: botResponse,
            timestamp: new Date(),
            isFinal: true,
          },
        ]);

        setIsComplete(true);
        setTimeout(() => {
          setShowResults(true);
        }, 2000);
        nextQuestionOnly =
          "Thank you for completing the interview! Loading your detailed results...";
      }

      const botMessage = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: nextQuestionOnly,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);

      if (videoRef.current && videoRef.current.videoWidth > 0) {
        const img = captureImage();
        if (img) {
          try {
            const imageFeedback = await askAzureWithImage(
              "Analyze this candidate's posture and body language in a mock interview setting. Provide 2-3 brief, constructive tips for improvement. Focus on professional presentation. Please provide a clean response without any markdown formatting like ** or *.",
              img
            );

            const cleanImageFeedback = imageFeedback
              .replace(/\*\*(.*?)\*\*/g, "$1")
              .replace(/\*(.*?)\*/g, "$1");

            setAiFeedback((prev) => {
              const updatedFeedback = [...prev];
              const lastIndex = updatedFeedback.length - 1;
              if (lastIndex >= 0) {
                updatedFeedback[lastIndex] = {
                  ...updatedFeedback[lastIndex],
                  cameraFeedback: cleanImageFeedback,
                };
              }
              return updatedFeedback;
            });
          } catch (imageError) {
            console.error("Image analysis error:", imageError);
          }
        }
      }
    } catch (error) {
      console.error("Error generating response:", error);
      let fallbackResponse = "";

      if (currentQuestion < interviewQuestions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
        fallbackResponse = `Thank you for that response. Let me ask you the next question: ${
          interviewQuestions[currentQuestion + 1]
        }`;
      } else {
        fallbackResponse =
          "Thank you for completing the interview! That concludes our session. You've done well.";
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
    setIsStarted(false);
    setMessages([]);
    setCurrentQuestion(0);
    setIsComplete(false);
    setCurrentInput("");
    setInterviewQuestions([]);
    setUserResponses([]);
    setAiFeedback([]);
    setShowResults(false);
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
              />
            )}

            {setupStep === 2 && (
              <InterviewSetupStep2
                onBack={() => setSetupStep(1)}
                onNext={() => setSetupStep(3)}
              />
            )}

            {setupStep === 3 && (
              <InterviewSetupStep3
                onBack={() => setSetupStep(2)}
                onAnalysisComplete={handleResumeAnalysis}
                resumeUploaded={resumeUploaded}
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <VideoFeedPanel
              videoRef={videoRef}
              isCameraOn={isCameraOn}
              onStartCamera={startCamera}
              onStopCamera={stopCamera}
            />
          </div>

          <div className="lg:col-span-2">
            <ChatPanel
              messages={messages}
              currentInput={currentInput}
              setCurrentInput={setCurrentInput}
              isLoading={isLoading}
              isListening={isListening}
              currentQuestion={currentQuestion}
              totalQuestions={interviewQuestions.length}
              isComplete={isComplete}
              onSendMessage={sendMessage}
              onVoiceInput={handleVoiceInput}
              onStopListening={stopListening}
              onFinishInterview={() => {
                setIsComplete(true);
                setShowResults(true);
              }}
            />
          </div>

          <div className="space-y-6">
            <ProgressPanel
              completedQuestions={userResponses.length}
              totalQuestions={interviewQuestions.length}
            />
            <InterviewTipsPanel />
          </div>
        </div>
      </div>
    </div>
  );
}