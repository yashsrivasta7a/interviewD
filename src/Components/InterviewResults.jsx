import React, { useState, useEffect } from "react";
import { Button } from "./button";
import { Card, CardHeader, CardTitle, CardContent } from "./card";
import { Brain, ArrowLeft, CheckCircle, Clock, Users, RotateCcw, Trophy, Star, FileText, Download, Camera, Code, Copy, Check, TrendingUp, ClipboardCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { askAzureText } from "../Utils/Feedback";
import jsPDF from 'jspdf';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  ArcElement
} from 'chart.js';
import { Bar, Radar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  ArcElement
);

export default function InterviewResults({ 
  selectedRole, 
  selectedLevel, 
  interviewQuestions, 
  userResponses, 
  aiFeedback, 
  timer, 
  timeLeft, 
  onStartNewInterview,
  backgroundAnalyses = [] // NEW: Receive background analyses
}) {
  const [interviewSummary, setInterviewSummary] = useState("");
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [photoAnalysisSummary, setPhotoAnalysisSummary] = useState(""); // NEW
  const [isLoadingPhotoSummary, setIsLoadingPhotoSummary] = useState(true); // NEW
  const [viewMode, setViewMode] = useState("formatted"); // "formatted" or "json"
  const [copied, setCopied] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const navigate = useNavigate();
  const [hasResumeData, setHasResumeData] = useState(false);

  useEffect(() => {
    // Check if resume data exists
    const resumeData = localStorage.getItem('resumeAnalysis');
    setHasResumeData(!!resumeData);

    const generateInterviewSummary = async () => {
      try {
        setIsLoadingSummary(true);
        
        const summaryData = {
          role: selectedRole,
          level: selectedLevel,
          totalQuestions: interviewQuestions.length,
          answeredQuestions: userResponses.length,
          duration: timer - timeLeft,
          feedback: aiFeedback
        };

        const summaryPrompt = `
        You are an expert interview coach providing a comprehensive summary of a candidate's interview performance.

        Interview Details:
        - Position: ${selectedRole}
        - Experience Level: ${selectedLevel}
        - Questions Asked: ${summaryData.totalQuestions}
        - Questions Answered: ${summaryData.answeredQuestions}
        - Interview Duration: ${Math.floor(summaryData.duration / 60)} minutes ${summaryData.duration % 60} seconds

        Questions, Answers, and Feedback:
        ${aiFeedback.map((item, index) => `
        Question ${index + 1}: "${item.question}"
        Candidate's Answer: "${item.userAnswer}"
        AI Feedback: "${item.feedback}"
        ${item.cameraFeedback ? `Body Language Analysis: "${item.cameraFeedback}"` : ''}
        `).join('\n')}

        Please provide a comprehensive interview summary that includes:
        1. Overall performance assessment
        2. Key strengths demonstrated
        3. Areas for improvement
        4. Communication skills evaluation
        5. Technical competency (if applicable)
        6. Confidence and presentation
        7. Final recommendation and next steps

        Keep the summary professional, constructive, and encouraging. Focus on actionable insights that will help the candidate improve their interview skills. Limit to 300-400 words. Please provide a clean response without any markdown formatting like ** or * or # signs.
        `;       
         const summary = await askAzureText(summaryPrompt);
        const cleanSummary = summary
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/#{1,6}\s*(.*?)(\n|$)/g, '$1$2')
          .replace(/^\s*[-*+]\s+/gm, '• ')
          .replace(/^\s*\d+\.\s+/gm, '• ')
          .replace(/\b(Overall Performance Assessment|Key Strengths|Areas for Improvement|Communication Skills|Technical Competency|Confidence and Presentation|Final Recommendation|Next Steps)(\s*:)/gi, '<strong>$1$2</strong>');
        setInterviewSummary(cleanSummary);
      } catch (error) {
        console.error("Error generating interview summary:", error);
        setInterviewSummary("We encountered an issue generating your interview summary. However, your detailed feedback is available below.");
      } finally {
        setIsLoadingSummary(false);
      }
    };

    generateInterviewSummary();
  }, [selectedRole, selectedLevel, interviewQuestions.length, userResponses.length, timer, timeLeft, aiFeedback]);

  // NEW: Generate photo analysis summary
  useEffect(() => {
    const generatePhotoAnalysisSummary = async () => {
      if (!backgroundAnalyses || backgroundAnalyses.length === 0) {
        setIsLoadingPhotoSummary(false);
        setPhotoAnalysisSummary("No photo analyses were captured during this interview.");
        return;
      }

      try {
        setIsLoadingPhotoSummary(true);
        console.log(`📊 Generating summary from ${backgroundAnalyses.length} photo analyses...`);

        const successfulAnalyses = backgroundAnalyses.filter(a => !a.error);
        
        if (successfulAnalyses.length === 0) {
          setPhotoAnalysisSummary("Photo analysis was attempted but encountered technical issues. Please ensure camera permissions are enabled for future interviews.");
          setIsLoadingPhotoSummary(false);
          return;
        }

        const photoSummaryPrompt = `
You are an expert body language and presentation coach analyzing a candidate's visual performance throughout an interview.

Interview Context:
- Position: ${selectedRole}
- Experience Level: ${selectedLevel}
- Total Photo Captures: ${backgroundAnalyses.length}
- Successful Analyses: ${successfulAnalyses.length}
- Interview Duration: ${Math.floor((timer - timeLeft) / 60)} minutes

Individual Photo Analyses (captured every 15 seconds):
${successfulAnalyses.map((analysis, index) => `
Capture #${analysis.captureNumber} at ${new Date(analysis.timestamp).toLocaleTimeString()}:
During Question ${analysis.questionNumber}: "${analysis.currentQuestion}"
Analysis: ${analysis.analysis}
`).join('\n')}

Please provide a comprehensive visual presentation summary .
Keep the summary professional, constructive, and short . Focus on patterns across all captures, not individual moments. Limit to 2-3 lines only . Please provide a clean response without any markdown formatting like ** or * or # signs.
        `;

        const photoSummary = await askAzureText(photoSummaryPrompt);
        const cleanPhotoSummary = photoSummary
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/#{1,6}\s*(.*?)(\n|$)/g, '$1$2')
          .replace(/^\s*[-*+]\s+/gm, '• ')
          .replace(/^\s*\d+\.\s+/gm, '• ')
          .replace(/\b(Overall Body Language Assessment|Engagement & Confidence Patterns|Key Strengths|Areas for Improvement|Progression Analysis|Actionable Recommendations|OVERALL|ENGAGEMENT|KEY STRENGTHS|AREAS|PROGRESSION|ACTIONABLE)(\s*:)/gi, '<strong>$1$2</strong>');
        
        setPhotoAnalysisSummary(cleanPhotoSummary);
        console.log("✅ Photo analysis summary generated successfully");
      } catch (error) {
        console.error("Error generating photo analysis summary:", error);
        setPhotoAnalysisSummary("We encountered an issue generating your photo analysis summary. However, individual photo analyses are available below if captured.");
      } finally {
        setIsLoadingPhotoSummary(false);
      }
    };

    generatePhotoAnalysisSummary();
  }, [backgroundAnalyses, selectedRole, selectedLevel, timer, timeLeft]);

  // Generate performance metrics for charts
  useEffect(() => {
    const generatePerformanceMetrics = async () => {
      try {
        setIsLoadingMetrics(true);
        
        const metricsPrompt = `
You are an expert data analyst extracting performance metrics from interview feedback.

Interview Summary:
${interviewSummary}

AI Feedback for each question:
${aiFeedback.map((item, index) => `
Question ${index + 1}: "${item.question}"
Feedback: "${item.feedback}"
`).join('\n')}

Please analyze the feedback and provide a JSON response with the following performance metrics (rate each on a scale of 0-100):

{
  "overallScore": <number 0-100>,
  "technicalSkills": <number 0-100>,
  "communication": <number 0-100>,
  "problemSolving": <number 0-100>,
  "confidence": <number 0-100>,
  "clarity": <number 0-100>,
  "relevance": <number 0-100>,
  "bodyLanguage": <number 0-100>,
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["area1", "area2", "area3"]
}

Base your ratings on the feedback provided. Be objective and fair. Only respond with valid JSON, no additional text.
        `;

        const metricsResponse = await askAzureText(metricsPrompt);
        
        // Try to parse JSON from response
        let metricsData;
        try {
          // Find JSON in response
          const jsonMatch = metricsResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            metricsData = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error("No JSON found in response");
          }
        } catch (parseError) {
          console.error("Error parsing metrics JSON:", parseError);
          // Fallback metrics
          metricsData = {
            overallScore: 75,
            technicalSkills: 70,
            communication: 80,
            problemSolving: 75,
            confidence: 70,
            clarity: 75,
            relevance: 80,
            bodyLanguage: 75,
            strengths: ["Good communication", "Clear responses", "Professional demeanor"],
            improvements: ["Technical depth", "More examples", "Confidence"]
          };
        }
        
        setPerformanceMetrics(metricsData);
      } catch (error) {
        console.error("Error generating performance metrics:", error);
        // Set default metrics on error
        setPerformanceMetrics({
          overallScore: 75,
          technicalSkills: 70,
          communication: 80,
          problemSolving: 75,
          confidence: 70,
          clarity: 75,
          relevance: 80,
          bodyLanguage: 75,
          strengths: ["Good communication", "Clear responses", "Professional demeanor"],
          improvements: ["Technical depth", "More examples", "Confidence"]
        });
      } finally {
        setIsLoadingMetrics(false);
      }
    };

    if (interviewSummary && !isLoadingSummary) {
      generatePerformanceMetrics();
    }
  }, [interviewSummary, isLoadingSummary, aiFeedback]);

  const downloadSummary = () => {
    const doc = new jsPDF();
    
    // Set up the document
    doc.setFontSize(20);
    doc.text('INTERVIEW SUMMARY & ASSESSMENT', 20, 20);
    
    // Add a line separator
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);
    
    let yPosition = 35;
    
    // Interview Details
    doc.setFontSize(14);
    doc.text('Interview Details:', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.text(`Position: ${selectedRole}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Experience Level: ${selectedLevel}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Questions Asked: ${interviewQuestions.length}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Questions Answered: ${userResponses.length}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Interview Duration: ${formatTime(timer - timeLeft)}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Completion Rate: ${Math.round((userResponses.length / interviewQuestions.length) * 100)}%`, 20, yPosition);
    yPosition += 7;
    doc.text(`Photo Captures: ${backgroundAnalyses.length}`, 20, yPosition);
    yPosition += 15;
    
    // Comprehensive Summary
    doc.setFontSize(14);
    doc.text('Comprehensive Summary:', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    const cleanSummaryText = interviewSummary.replace(/<\/?strong>/g, '').replace(/&nbsp;/g, ' ');
    const summaryLines = doc.splitTextToSize(cleanSummaryText, 170);
    
    summaryLines.forEach((line) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 20, yPosition);
      yPosition += 5;
    });
    
    yPosition += 10;
    
    // NEW: Photo Analysis Summary
    if (backgroundAnalyses.length > 0) {
      doc.setFontSize(14);
      if (yPosition > 260) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text('Visual Presentation & Body Language Analysis:', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      const cleanPhotoSummaryText = photoAnalysisSummary.replace(/<\/?strong>/g, '').replace(/&nbsp;/g, ' ');
      const photoSummaryLines = doc.splitTextToSize(cleanPhotoSummaryText, 170);
      
      photoSummaryLines.forEach((line) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 20, yPosition);
        yPosition += 5;
      });
      
      yPosition += 10;
    }
    
    // Detailed Feedback
    doc.setFontSize(14);
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    doc.text('Detailed Feedback:', 20, yPosition);
    yPosition += 10;
    
    aiFeedback.forEach((feedback) => {
      doc.setFontSize(12);
      
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Question header
      doc.text(`Question ${feedback.questionNumber}: ${feedback.question}`, 20, yPosition);
      yPosition += 10;
      
      // User response
      doc.setFontSize(10);
      doc.text('Your Response:', 20, yPosition);
      yPosition += 6;
      const responseLines = doc.splitTextToSize(feedback.userAnswer, 170);
      responseLines.forEach((line) => {
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 25, yPosition);
        yPosition += 4;
      });
      yPosition += 5;
      
      // AI Feedback
      doc.text('AI Feedback:', 20, yPosition);
      yPosition += 6;
      const feedbackLines = doc.splitTextToSize(feedback.feedback, 170);
      feedbackLines.forEach((line) => {
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 25, yPosition);
        yPosition += 4;
      });
      yPosition += 5;
      
      // Camera feedback if available
      if (feedback.cameraFeedback) {
        doc.text('Body Language & Posture Analysis:', 20, yPosition);
        yPosition += 6;
        const cameraLines = doc.splitTextToSize(feedback.cameraFeedback, 170);
        cameraLines.forEach((line) => {
          if (yPosition > 280) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, 25, yPosition);
          yPosition += 4;
        });
        yPosition += 5;
      }
      
      // Add separator line
      if (yPosition > 275) {
        doc.addPage();
        yPosition = 20;
      }
      doc.setLineWidth(0.2);
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 10;
    });

    // NEW: Detailed Photo Analyses
    if (backgroundAnalyses.length > 0) {
      const successfulAnalyses = backgroundAnalyses.filter(a => !a.error);
      
      if (successfulAnalyses.length > 0) {
        doc.addPage();
        yPosition = 20;
        
        doc.setFontSize(14);
        doc.text('Detailed Photo Analyses (Every 15 seconds):', 20, yPosition);
        yPosition += 10;
        
        successfulAnalyses.forEach((analysis) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(11);
          doc.text(`Capture #${analysis.captureNumber} - ${new Date(analysis.timestamp).toLocaleTimeString()}`, 20, yPosition);
          yPosition += 7;
          
          doc.setFontSize(10);
          doc.text(`During Question ${analysis.questionNumber}`, 20, yPosition);
          yPosition += 6;
          
          const analysisLines = doc.splitTextToSize(analysis.analysis, 170);
          analysisLines.forEach((line) => {
            if (yPosition > 280) {
              doc.addPage();
              yPosition = 20;
            }
            doc.text(line, 25, yPosition);
            yPosition += 4;
          });
          yPosition += 8;
        });
      }
    }
    
    // Add footer with generation date
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, 285);
      doc.text(`Page ${i} of ${pageCount}`, 170, 285);
    }
    
    // Save the PDF
    doc.save(`Interview_Summary_${selectedRole.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const generateJSONFeedback = () => {
    return {
      interviewMetadata: {
        position: selectedRole,
        experienceLevel: selectedLevel,
        timestamp: new Date().toISOString(),
        duration: {
          seconds: timer - timeLeft,
          formatted: formatTime(timer - timeLeft)
        },
        completionRate: Math.round((userResponses.length / interviewQuestions.length) * 100),
        statistics: {
          totalQuestions: interviewQuestions.length,
          answeredQuestions: userResponses.length,
          photoCaptures: backgroundAnalyses.length
        }
      },
      comprehensiveSummary: {
        overallAssessment: interviewSummary.replace(/<\/?strong>/g, '').replace(/&nbsp;/g, ' '),
        visualPresentationAnalysis: photoAnalysisSummary.replace(/<\/?strong>/g, '').replace(/&nbsp;/g, ' ')
      },
      detailedFeedback: aiFeedback.map(feedback => ({
        questionNumber: feedback.questionNumber,
        question: feedback.question,
        userResponse: feedback.userAnswer,
        aiFeedback: feedback.feedback,
        bodyLanguageAnalysis: feedback.cameraFeedback || null,
        isFinalAssessment: feedback.isFinal || false
      })),
      photoAnalyses: backgroundAnalyses
        .filter(a => !a.error)
        .map(analysis => ({
          captureNumber: analysis.captureNumber,
          timestamp: analysis.timestamp,
          questionNumber: analysis.questionNumber,
          currentQuestion: analysis.currentQuestion,
          analysis: analysis.analysis
        }))
    };
  };

  const copyJSONToClipboard = () => {
    const jsonData = JSON.stringify(generateJSONFeedback(), null, 2);
    navigator.clipboard.writeText(jsonData).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const downloadJSON = () => {
    const jsonData = JSON.stringify(generateJSONFeedback(), null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Interview_Feedback_${selectedRole.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
      <h1 className="text-xl font-bold text-slate-900">Interview Results</h1>
    </div>

    <div className="w-[112px]"></div>
    
  </div>
</header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-emerald-800 mb-2">Interview Complete!</h1>
          <p className="text-xl text-emerald-700 mb-4">
            Excellent work! You've successfully completed your {selectedLevel} level {selectedRole} interview.
          </p>
          <p className="text-lg text-slate-600">
            Here's your comprehensive feedback and performance analysis.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
            <CardContent className="p-5 text-center mt-5">
              <Clock className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
              <div className="text-2xl font-bold text-emerald-800">{formatTime(timer - timeLeft)}</div>
              <div className="text-sm text-emerald-600">Duration</div>
            </CardContent>
          </Card>
          
          <Card className="border-teal-200 bg-gradient-to-r from-teal-50 to-blue-50">
            <CardContent className="p-5 mt-5 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-teal-600" />
              <div className="text-2xl font-bold text-teal-800">{userResponses.length}</div>
              <div className="text-sm text-teal-600">Questions Answered</div>
            </CardContent>
          </Card>
          
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-5 mt-5 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-800">{Math.round((userResponses.length / interviewQuestions.length) * 100)}%</div>
              <div className="text-sm text-purple-600">Completion Rate</div>
            </CardContent>
          </Card>
          
          <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
            <CardContent className="p-5 mt-5 text-center">
              <Camera className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-orange-800">{backgroundAnalyses.length}</div>
              <div className="text-sm text-orange-600">Photo Captures</div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Charts Section */}
        {!isLoadingMetrics && performanceMetrics && (
          <Card className="border-slate-200 shadow-xl bg-white/90 backdrop-blur-sm mb-8">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-200">
              <CardTitle className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
                <TrendingUp className="w-6 h-6 text-purple-600" />
                <span>Overall Performance Assessment</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 mt-5">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Radar Chart - Skills Assessment */}
                <div className="bg-slate-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 text-center">Skills Assessment</h3>
                  <Radar
                    data={{
                      labels: ['Technical', 'Communication', 'Problem Solving', 'Confidence', 'Clarity', 'Relevance'],
                      datasets: [
                        {
                          label: 'Your Performance',
                          data: [
                            performanceMetrics.technicalSkills,
                            performanceMetrics.communication,
                            performanceMetrics.problemSolving,
                            performanceMetrics.confidence,
                            performanceMetrics.clarity,
                            performanceMetrics.relevance
                          ],
                          backgroundColor: 'rgba(147, 51, 234, 0.2)',
                          borderColor: 'rgba(147, 51, 234, 1)',
                          borderWidth: 2,
                          pointBackgroundColor: 'rgba(147, 51, 234, 1)',
                          pointBorderColor: '#fff',
                          pointHoverBackgroundColor: '#fff',
                          pointHoverBorderColor: 'rgba(147, 51, 234, 1)'
                        }
                      ]
                    }}
                    options={{
                      scales: {
                        r: {
                          angleLines: {
                            display: true
                          },
                          suggestedMin: 0,
                          suggestedMax: 100,
                          ticks: {
                            stepSize: 20
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          display: false
                        }
                      }
                    }}
                  />
                </div>

                {/* Doughnut Chart - Overall Score */}
                <div className="bg-slate-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 text-center">Overall Performance Score</h3>
                  <div className="flex flex-col items-center">
                    <div className="w-64 h-64">
                      <Doughnut
                        data={{
                          labels: ['Achieved', 'Remaining'],
                          datasets: [
                            {
                              data: [performanceMetrics.overallScore, 100 - performanceMetrics.overallScore],
                              backgroundColor: [
                                'rgba(16, 185, 129, 0.8)',
                                'rgba(226, 232, 240, 0.3)'
                              ],
                              borderColor: [
                                'rgba(16, 185, 129, 1)',
                                'rgba(226, 232, 240, 1)'
                              ],
                              borderWidth: 2
                            }
                          ]
                        }}
                        options={{
                          cutout: '70%',
                          plugins: {
                            legend: {
                              display: false
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  return context.label + ': ' + context.parsed + '%';
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="mt-4 text-center">
                      <div className="text-4xl font-bold text-emerald-600">{performanceMetrics.overallScore}%</div>
                      <div className="text-sm text-slate-600">Overall Score</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bar Chart - Detailed Metrics */}
              <div className="bg-slate-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 text-center">Detailed Performance Breakdown</h3>
                <Bar
                  data={{
                    labels: ['Technical Skills', 'Communication', 'Problem Solving', 'Confidence', 'Clarity', 'Relevance', 'Body Language'],
                    datasets: [
                      {
                        label: 'Performance Score',
                        data: [
                          performanceMetrics.technicalSkills,
                          performanceMetrics.communication,
                          performanceMetrics.problemSolving,
                          performanceMetrics.confidence,
                          performanceMetrics.clarity,
                          performanceMetrics.relevance,
                          performanceMetrics.bodyLanguage
                        ],
                        backgroundColor: [
                          'rgba(147, 51, 234, 0.7)',
                          'rgba(59, 130, 246, 0.7)',
                          'rgba(16, 185, 129, 0.7)',
                          'rgba(251, 146, 60, 0.7)',
                          'rgba(236, 72, 153, 0.7)',
                          'rgba(99, 102, 241, 0.7)',
                          'rgba(245, 158, 11, 0.7)'
                        ],
                        borderColor: [
                          'rgba(147, 51, 234, 1)',
                          'rgba(59, 130, 246, 1)',
                          'rgba(16, 185, 129, 1)',
                          'rgba(251, 146, 60, 1)',
                          'rgba(236, 72, 153, 1)',
                          'rgba(99, 102, 241, 1)',
                          'rgba(245, 158, 11, 1)'
                        ],
                        borderWidth: 2
                      }
                    ]
                  }}
                  options={{
                    indexAxis: 'y',
                    scales: {
                      x: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                          callback: function(value) {
                            return value + '%';
                          }
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return 'Score: ' + context.parsed.x + '%';
                          }
                        }
                      }
                    }
                  }}
                />
              </div>

              {/* Strengths and Improvements */}
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-emerald-900 mb-4 flex items-center">
                    <Trophy className="w-5 h-5 mr-2" />
                    Key Strengths
                  </h3>
                  <ul className="space-y-2">
                    {performanceMetrics.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-2">
                    {performanceMetrics.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start">
                        <Star className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-slate-200 shadow-xl bg-white/90 backdrop-blur-sm mb-8">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
            <CardTitle className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
              <FileText className="w-6 h-6 text-blue-600" />
              <span>Interview Summary & Assessment</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 mt-5">
            {isLoadingSummary ? (
              <div className="flex items-center justify-center space-x-3 py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-slate-600 text-lg">Generating your comprehensive interview summary...</p>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <div className="prose prose-slate max-w-none">
                  <div 
                    className="text-slate-800 leading-relaxed text-lg whitespace-pre-line"
                    dangerouslySetInnerHTML={{ __html: interviewSummary }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* NEW: Photo Analysis Summary Section */}
        {backgroundAnalyses.length > 0 && (
          <Card className="border-slate-200 shadow-xl bg-white/90 backdrop-blur-sm mb-8">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-slate-200">
              <CardTitle className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
                <Camera className="w-6 h-6 text-orange-600" />
                <span>Visual Presentation & Body Language Analysis</span>
              </CardTitle>
              <p className="text-sm text-slate-600 mt-2">
                Based on {backgroundAnalyses.filter(a => !a.error).length} photo captures throughout your interview
              </p>
            </CardHeader>
            <CardContent className="p-8 mt-5">
              {isLoadingPhotoSummary ? (
                <div className="flex items-center justify-center space-x-3 py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                  <p className="text-slate-600 text-lg">Analyzing your visual presentation patterns...</p>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-6">
                  <div className="prose prose-slate max-w-none">
                    <div 
                      className="text-slate-800 leading-relaxed text-lg whitespace-pre-line"
                      dangerouslySetInnerHTML={{ __html: photoAnalysisSummary }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="border-slate-200 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
                <Brain className="w-6 h-6 text-emerald-600" />
                <span>Detailed Interview Feedback</span>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setViewMode(viewMode === "formatted" ? "json" : "formatted")}
                  variant="outline"
                  size="sm"
                  className="border-slate-300"
                >
                  <Code className="w-4 h-4 mr-2" />
                  {viewMode === "formatted" ? "View JSON" : "View Formatted"}
                </Button>
                {viewMode === "json" && (
                  <>
                    <Button
                      onClick={copyJSONToClipboard}
                      variant="outline"
                      size="sm"
                      className="border-slate-300"
                    >
                      {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                      {copied ? "Copied!" : "Copy JSON"}
                    </Button>
                    <Button
                      onClick={downloadJSON}
                      variant="outline"
                      size="sm"
                      className="border-slate-300"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download JSON
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 mt-5">
            {viewMode === "json" ? (
              <div className="bg-slate-900 rounded-lg p-6 overflow-auto max-h-[600px]">
                <pre className="text-green-400 text-sm font-mono">
                  {JSON.stringify(generateJSONFeedback(), null, 2)}
                </pre>
              </div>
            ) : (
              <div className="space-y-8">
              {aiFeedback.map((feedback) => (
                <div key={feedback.id} className="border border-slate-200 rounded-xl p-6 bg-slate-50/50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {feedback.questionNumber}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Question {feedback.questionNumber}
                        </h3>
                        {feedback.isFinal && (
                          <div className="bg-gradient-to-r from-emerald-100 to-teal-100 px-3 py-1 rounded-full">
                            <span className="text-sm font-medium text-emerald-700">⭐ Final Assessment</span>
                          </div>
                        )}
                      </div>
                      <p className="text-slate-700 italic text-lg mb-4">"{feedback.question}"</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-bold text-slate-900 mb-3 flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <span>Your Response</span>
                    </h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-slate-800 leading-relaxed">{feedback.userAnswer}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-bold text-slate-900 mb-3 flex items-center space-x-2">
                      <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                      <span>AI Feedback</span>
                    </h4>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                      <p className="text-slate-800 leading-relaxed">{feedback.feedback}</p>
                    </div>
                  </div>

                  {feedback.cameraFeedback && (
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3 flex items-center space-x-2">
                        <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                        <span>📸 Body Language & Posture Analysis</span>
                      </h4>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <p className="text-slate-800 leading-relaxed">{feedback.cameraFeedback}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={onStartNewInterview}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3"
                size="lg"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Start New Interview
              </Button>
              
              <Button
                onClick={downloadSummary}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3"
                size="lg"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Summary
              </Button>

              {hasResumeData && (
                <Button
                  onClick={() => navigate('/ats-check')}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3"
                  size="lg"
                >
                  <ClipboardCheck className="w-5 h-5 mr-2" />
                  View ATS Report
                </Button>
              )}
               <Link to="/">
                <Button
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-3 shadow-sm hover:shadow-md transition-all duration-300"
                  size="lg"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};