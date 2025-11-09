import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  Award,
  Target,
  Zap,
  ArrowLeft,
  Download,
  RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { Button } from './button';
import { Link } from 'react-router-dom';
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
  Filler
} from 'chart.js';
import { Bar, Radar } from 'react-chartjs-2';

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
  Filler
);

const AtsCheck = () => {
  const [resumeData, setResumeData] = useState(null);
  const [atsScore, setAtsScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load resume analysis from localStorage
    const storedAnalysis = localStorage.getItem('resumeAnalysis');
    if (storedAnalysis) {
      const data = JSON.parse(storedAnalysis);
      setResumeData(data);
      calculateATSScore(data);
    }
    setLoading(false);
  }, []);

  const calculateATSScore = (data) => {
    const scores = {
      contactInfo: 0,
      summary: 0,
      skills: 0,
      experience: 0,
      education: 0,
      formatting: 0,
      keywords: 0,
      achievements: 0
    };

    const feedback = {
      strengths: [],
      warnings: [],
      critical: []
    };

    // Contact Information (15 points)
    let contactScore = 0;
    if (data.name && data.name.trim() !== '') {
      contactScore += 5;
      feedback.strengths.push('Name is clearly stated');
    } else {
      feedback.critical.push('Missing name');
    }
    if (data.email && data.email.includes('@')) {
      contactScore += 5;
      feedback.strengths.push('Valid email address found');
    } else {
      feedback.critical.push('Missing or invalid email');
    }
    if (data.phone && data.phone.trim() !== '') {
      contactScore += 3;
      feedback.strengths.push('Phone number provided');
    } else {
      feedback.warnings.push('Phone number not found');
    }
    if (data.location && data.location.trim() !== '') {
      contactScore += 2;
    }
    scores.contactInfo = contactScore;

    // Summary/Objective (15 points)
    if (data.summary && data.summary.length > 50) {
      scores.summary = 15;
      feedback.strengths.push('Professional summary is well-detailed');
    } else if (data.summary && data.summary.length > 20) {
      scores.summary = 10;
      feedback.warnings.push('Professional summary is too brief');
    } else {
      scores.summary = 0;
      feedback.warnings.push('Missing professional summary or objective');
    }

    // Skills (20 points)
    if (data.skills && data.skills.length >= 8) {
      scores.skills = 20;
      feedback.strengths.push(`${data.skills.length} skills listed - excellent variety`);
    } else if (data.skills && data.skills.length >= 5) {
      scores.skills = 15;
      feedback.strengths.push(`${data.skills.length} skills listed`);
    } else if (data.skills && data.skills.length >= 3) {
      scores.skills = 10;
      feedback.warnings.push('Limited skills listed - add more relevant skills');
    } else {
      scores.skills = 5;
      feedback.critical.push('Very few or no skills listed');
    }

    // Experience (25 points)
    if (data.experience && data.experience.length >= 3) {
      scores.experience = 25;
      feedback.strengths.push(`${data.experience.length} work experiences listed`);
    } else if (data.experience && data.experience.length >= 2) {
      scores.experience = 20;
      feedback.strengths.push(`${data.experience.length} work experiences listed`);
    } else if (data.experience && data.experience.length >= 1) {
      scores.experience = 15;
      feedback.warnings.push('Limited work experience entries');
    } else {
      scores.experience = 5;
      feedback.critical.push('No work experience listed');
    }

    // Education (10 points)
    if (data.education && data.education.length >= 1) {
      scores.education = 10;
      feedback.strengths.push('Education details provided');
    } else {
      scores.education = 0;
      feedback.warnings.push('Missing education information');
    }

    // Formatting & Keywords (10 points)
    let formatScore = 10;
    if (!data.name || !data.email) {
      formatScore -= 3;
    }
    if (!data.skills || data.skills.length === 0) {
      formatScore -= 3;
    }
    if (!data.experience || data.experience.length === 0) {
      formatScore -= 4;
    }
    scores.formatting = Math.max(0, formatScore);

    // Keywords & Achievements (5 points)
    let keywordScore = 0;
    const resumeText = JSON.stringify(data).toLowerCase();
    const keyKeywords = ['manage', 'develop', 'lead', 'design', 'implement', 'achieve', 'improve', 'create'];
    const foundKeywords = keyKeywords.filter(kw => resumeText.includes(kw));
    
    if (foundKeywords.length >= 5) {
      keywordScore = 5;
      feedback.strengths.push('Good use of action verbs and keywords');
    } else if (foundKeywords.length >= 3) {
      keywordScore = 3;
      feedback.warnings.push('Add more action verbs to descriptions');
    } else {
      keywordScore = 1;
      feedback.warnings.push('Use more action verbs (managed, developed, led, etc.)');
    }
    scores.keywords = keywordScore;

    // Calculate total score
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    
    // Determine rating
    let rating, color, recommendation;
    if (totalScore >= 85) {
      rating = 'Excellent';
      color = 'emerald';
      recommendation = 'Your resume is ATS-optimized and ready to submit!';
    } else if (totalScore >= 70) {
      rating = 'Good';
      color = 'blue';
      recommendation = 'Your resume is good but has room for improvement.';
    } else if (totalScore >= 50) {
      rating = 'Fair';
      color = 'orange';
      recommendation = 'Your resume needs significant improvements for ATS compatibility.';
    } else {
      rating = 'Poor';
      color = 'red';
      recommendation = 'Your resume requires major revisions to pass ATS screening.';
    }

    setAtsScore({
      total: totalScore,
      breakdown: scores,
      rating,
      color,
      recommendation,
      feedback
    });
  };

  const downloadReport = () => {
    const report = {
      resumeAnalysis: resumeData,
      atsScore: atsScore,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ATS_Report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black relative flex items-center justify-center">
        <div className="fixed inset-0 w-full min-h-screen overflow-hidden pointer-events-none -z-10">
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 80% 80% at 100% 100%, rgba(120,60,200,0.3) 0%, rgba(100,50,180,0.2) 25%, rgba(80,40,160,0.1) 50%, transparent 75%), radial-gradient(ellipse 80% 80% at 0% 100%, rgba(100,50,180,0.3) 0%, rgba(80,40,160,0.2) 25%, rgba(60,30,140,0.1) 50%, transparent 75%), #000000`,
            }}
          />
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-500/30 border-t-purple-500"></div>
          <p className="text-sm text-gray-400">Analyzing resume...</p>
        </div>
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="min-h-screen bg-black relative flex items-center justify-center p-6">
        <div className="fixed inset-0 w-full min-h-screen overflow-hidden pointer-events-none -z-10">
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 80% 80% at 100% 100%, rgba(120,60,200,0.3) 0%, rgba(100,50,180,0.2) 25%, rgba(80,40,160,0.1) 50%, transparent 75%), radial-gradient(ellipse 80% 80% at 0% 100%, rgba(100,50,180,0.3) 0%, rgba(80,40,160,0.2) 25%, rgba(60,30,140,0.1) 50%, transparent 75%), #000000`,
            }}
          />
        </div>
        <Card className="max-w-md border border-white/10 bg-white/[0.02] backdrop-blur-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-800/50 border border-gray-700 flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No Resume Data</h2>
            <p className="text-sm text-gray-400 mb-6">Upload and parse your resume to get started with ATS analysis.</p>
            <Link to="/">
              <Button className="bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-200">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Background effects */}
      <div className="fixed inset-0 w-full min-h-screen overflow-hidden pointer-events-none -z-10">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 80% at 100% 100%, rgba(120,60,200,0.3) 0%, rgba(100,50,180,0.2) 25%, rgba(80,40,160,0.1) 50%, transparent 75%), radial-gradient(ellipse 80% 80% at 0% 100%, rgba(100,50,180,0.3) 0%, rgba(80,40,160,0.2) 25%, rgba(60,30,140,0.1) 50%, transparent 75%), #000000`,
          }}
        />
      </div>

      <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="mt-3 container mx-auto px-6 py-5 flex items-center justify-between max-w-7xl">
          <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-purple-400" />
            </div>
            <h1 className="text-lg font-semibold text-white">
              ATS Compatibility Analysis
            </h1>
          </div>

          <Button onClick={downloadReport} className="bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200 text-sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-10 max-w-7xl relative z-10">
        {/* Overall Score Card */}
        <Card className="border border-white/10 bg-white/[0.02] backdrop-blur-xl mb-10 overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8 mt-5">
              <div className="flex items-center gap-4">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-${atsScore?.color}-500/20 to-${atsScore?.color}-600/10 border border-${atsScore?.color}-500/30 flex items-center justify-center`}>
                  <Award className={`w-10 h-10 text-${atsScore?.color}-400`} />
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-medium mb-1">ATS Compatibility Score</p>
                  <h2 className="text-5xl font-bold text-white">{atsScore?.total}<span className="text-2xl text-gray-500">/100</span></h2>
                  <p className={`text-sm font-semibold text-${atsScore?.color}-400 mt-1`}>{atsScore?.rating}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 text-center">
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                  <div className={`text-3xl font-bold text-${atsScore?.color}-400 mb-1`}>
                    {atsScore?.rating}
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Rating</div>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                  <div className="text-3xl font-bold text-emerald-400 mb-1">
                    {atsScore?.feedback.strengths.length}
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Strengths</div>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                  <div className="text-3xl font-bold text-orange-400 mb-1">
                    {atsScore?.feedback.warnings.length + atsScore?.feedback.critical.length}
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Issues</div>
                </div>
              </div>
            </div>

            <div className={`bg-gradient-to-r from-${atsScore?.color}-500/10 to-transparent border-l-2 border-${atsScore?.color}-500/50 rounded-r-lg p-5`}>
              <p className="text-sm text-gray-300 leading-relaxed">{atsScore?.recommendation}</p>
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Radar Chart */}
          <Card className="border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
            <CardHeader className="border-b border-white/5 px-6 py-4">
              <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                Score Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Radar
                data={{
                  labels: ['Contact Info', 'Summary', 'Skills', 'Experience', 'Education', 'Formatting', 'Keywords'],
                  datasets: [{
                    label: 'Your Score',
                    data: [
                      (atsScore?.breakdown.contactInfo / 15) * 100,
                      (atsScore?.breakdown.summary / 15) * 100,
                      (atsScore?.breakdown.skills / 20) * 100,
                      (atsScore?.breakdown.experience / 25) * 100,
                      (atsScore?.breakdown.education / 10) * 100,
                      (atsScore?.breakdown.formatting / 10) * 100,
                      (atsScore?.breakdown.keywords / 5) * 100
                    ],
                    backgroundColor: 'rgba(147, 51, 234, 0.3)',
                    borderColor: 'rgba(147, 51, 234, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(147, 51, 234, 1)',
                    pointBorderColor: '#fff',
                  }]
                }}
                options={{
                  scales: {
                    r: {
                      beginAtZero: true,
                      max: 100,
                      ticks: { 
                        stepSize: 20,
                        color: 'rgba(255, 255, 255, 0.7)'
                      },
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      pointLabels: {
                        color: 'rgba(255, 255, 255, 0.9)',
                        font: {
                          size: 12
                        }
                      }
                    }
                  },
                  plugins: {
                    legend: { display: false }
                  }
                }}
              />
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card className="border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
            <CardHeader className="border-b border-white/5 px-6 py-4">
              <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                Detailed Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Bar
                data={{
                  labels: ['Contact', 'Summary', 'Skills', 'Experience', 'Education', 'Format', 'Keywords'],
                  datasets: [{
                    label: 'Score',
                    data: [
                      atsScore?.breakdown.contactInfo,
                      atsScore?.breakdown.summary,
                      atsScore?.breakdown.skills,
                      atsScore?.breakdown.experience,
                      atsScore?.breakdown.education,
                      atsScore?.breakdown.formatting,
                      atsScore?.breakdown.keywords
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
                  }]
                }}
                options={{
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 25,
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                      },
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      }
                    },
                    x: {
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                      },
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
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
            </CardContent>
          </Card>
        </div>

        {/* Feedback Sections */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {/* Strengths */}
          <Card className="border border-emerald-500/20 bg-white/[0.02] backdrop-blur-xl overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
            <CardHeader className="border-b border-white/5 px-5 py-4 bg-emerald-500/5">
              <CardTitle className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 mt-4">
              <ul className="space-y-2.5">
                {atsScore?.feedback.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Warnings */}
          <Card className="border border-orange-500/20 bg-white/[0.02] backdrop-blur-xl overflow-hidden group hover:border-orange-500/40 transition-all duration-300">
            <CardHeader className="border-b border-white/5 px-5 py-4 bg-orange-500/5">
              <CardTitle className="text-sm font-semibold text-orange-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Warnings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 mt-4">
              <ul className="space-y-2.5">
                {atsScore?.feedback.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                    <span>{warning}</span>
                  </li>
                ))}
                {atsScore?.feedback.warnings.length === 0 && (
                  <li className="text-sm text-gray-500 italic">No warnings found</li>
                )}
              </ul>
            </CardContent>
          </Card>

          {/* Critical Issues */}
          <Card className="border border-red-500/20 bg-white/[0.02] backdrop-blur-xl overflow-hidden group hover:border-red-500/40 transition-all duration-300">
            <CardHeader className="border-b border-white/5 px-5 py-4 bg-red-500/5">
              <CardTitle className="text-sm font-semibold text-red-400 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Critical Issues
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 mt-5">
              <ul className="space-y-2.5">
                {atsScore?.feedback.critical.map((issue, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                    <span>{issue}</span>
                  </li>
                ))}
                {atsScore?.feedback.critical.length === 0 && (
                  <li className="text-sm text-gray-500 italic">No critical issues found</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Resume Preview */}
        <Card className="border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden mb-10">
          <CardHeader className="border-b border-white/5 px-6 py-4">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              Resume Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Contact Information</h3>
                <div className="bg-white/[0.03] border border-white/5 rounded-lg p-4 space-y-2.5">
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-gray-500 min-w-[70px]">Name</span>
                    <span className="text-sm text-gray-300">{resumeData.name || 'Not provided'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-gray-500 min-w-[70px]">Email</span>
                    <span className="text-sm text-gray-300">{resumeData.email || 'Not provided'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-gray-500 min-w-[70px]">Phone</span>
                    <span className="text-sm text-gray-300">{resumeData.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-gray-500 min-w-[70px]">Location</span>
                    <span className="text-sm text-gray-300">{resumeData.location || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Content Statistics</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/[0.03] border border-white/5 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-400 mb-1">{resumeData.skills?.length || 0}</div>
                    <div className="text-xs text-gray-500">Skills</div>
                  </div>
                  <div className="bg-white/[0.03] border border-white/5 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-400 mb-1">{resumeData.experience?.length || 0}</div>
                    <div className="text-xs text-gray-500">Experience</div>
                  </div>
                  <div className="bg-white/[0.03] border border-white/5 rounded-lg p-4">
                    <div className="text-2xl font-bold text-emerald-400 mb-1">{resumeData.education?.length || 0}</div>
                    <div className="text-xs text-gray-500">Education</div>
                  </div>
                  <div className="bg-white/[0.03] border border-white/5 rounded-lg p-4">
                    <div className="text-2xl font-bold text-orange-400 mb-1">{resumeData.projects?.length || 0}</div>
                    <div className="text-xs text-gray-500">Projects</div>
                  </div>
                </div>
              </div>
            </div>

            {resumeData.summary && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Professional Summary</h3>
                <div className="bg-white/[0.03] border border-white/5 rounded-lg p-4">
                  <p className="text-sm text-gray-300 leading-relaxed">{resumeData.summary}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/">
            <Button className="bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-200 px-6 py-2.5 text-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Button onClick={downloadReport} className="bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 hover:border-purple-500/50 transition-all duration-200 px-6 py-2.5 text-sm">
            <Download className="w-4 h-4 mr-2" />
            Download Full Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AtsCheck;