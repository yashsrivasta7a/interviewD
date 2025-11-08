import React, { useState, useEffect } from 'react';
import { Upload, FileText, Loader2, CheckCircle, XCircle, Brain, User, Briefcase, GraduationCap, Award, Mail, Phone, MapPin } from 'lucide-react';

const ResumeParser = () => {
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parsedText, setParsedText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [pdfLoaded, setPdfLoaded] = useState(false);

  // Azure OpenAI Configuration
  const AZURE_ENDPOINT = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
  const AZURE_KEY = import.meta.env.VITE_AZURE_OPENAI_KEY;
  const DEPLOYMENT_NAME = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME;

  useEffect(() => {
    // Load PDF.js library
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      setPdfLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
        setError('Please upload a PDF file only');
        return;
      }
      setFile(selectedFile);
      setError('');
      setParsedText('');
      setAnalysis(null);
    }
  };

  const extractTextFromPDF = async (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      
      fileReader.onload = async function() {
        try {
          const typedarray = new Uint8Array(this.result);
          const pdf = await window.pdfjsLib.getDocument(typedarray).promise;
          let fullText = '';

          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
          }

          resolve(fullText);
        } catch (error) {
          reject(error);
        }
      };

      fileReader.onerror = () => reject(new Error('Failed to read PDF file'));
      fileReader.readAsArrayBuffer(file);
    });
  };

  const parseAndAnalyze = async () => {
    if (!file) {
      setError('Please select a PDF file first');
      return;
    }

    if (!pdfLoaded) {
      setError('PDF library is still loading. Please wait a moment and try again.');
      return;
    }

    setParsing(true);
    setError('');
    setParsedText('');
    setAnalysis(null);

    try {
      // Extract text from PDF
      const extractedText = await extractTextFromPDF(file);

      if (!extractedText || extractedText.trim().length === 0) {
        setError('No text content found in the PDF');
        setParsing(false);
        return;
      }

      setParsedText(extractedText);

      // Analyze with Azure GPT
      await analyzeWithAzureGPT(extractedText);

    } catch (err) {
      console.error('Error:', err);
      setError('Error parsing PDF: ' + err.message);
      setParsing(false);
    }
  };

  const analyzeWithAzureGPT = async (resumeText) => {
    setError('');

    try {
      const systemPrompt = `You are an expert resume analyzer. Analyze the resume and extract information in a strict JSON format. Return ONLY valid JSON with no markdown, no code blocks, no explanations.

The JSON must have these exact fields:
{
  "name": "full name",
  "email": "email address",
  "phone": "phone number",
  "location": "location/city",
  "summary": "professional summary or objective",
  "skills": ["skill1", "skill2", "skill3"],
  "experience": [
    {
      "company": "company name",
      "position": "job title",
      "duration": "time period",
      "responsibilities": "key responsibilities and achievements"
    }
  ],
  "education": [
    {
      "institution": "school name",
      "degree": "degree/program",
      "duration": "time period"
    }
  ],
   "projects": [
    {
      "name": "Project Name",
      "description": "Brief description of the project",
      "technologies": ["Tech1", "Tech2"],
    }
  ],
  "certifications": ["cert1", "cert2"],
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2"],
  "overallScore": 8
}

Analyze the resume thoroughly and provide detailed insights. If information is missing, use empty strings or empty arrays.`;

      const response = await fetch(
        `${AZURE_ENDPOINT}/openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=2024-08-01-preview`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': AZURE_KEY,
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: systemPrompt
              },
              {
                role: 'user',
                content: `Analyze this resume and return structured JSON:\n\n${resumeText}`
              }
            ],
            temperature: 0.2,
            max_tokens: 3000,
            response_format: { type: "json_object" }
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Azure API Error:', errorText);
        throw new Error(`Azure API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Azure Response:', data);
      
      const content = data.choices[0].message.content;
      
      try {
        let cleanContent = content.trim();
        cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        
        const analysisData = JSON.parse(cleanContent);
        setAnalysis(analysisData);
      } catch (parseErr) {
        console.error('JSON Parse Error:', parseErr);
        setError('Failed to parse AI response. Please try again.');
      }

    } catch (err) {
      console.error('Analysis Error:', err);
      setError('Error analyzing resume: ' + err.message);
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">PDF Resume Parser with Azure AI</h1>
          </div>

          {!pdfLoaded && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <Loader2 className="w-4 h-4 inline animate-spin mr-2" />
                Loading PDF library...
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Upload your resume in PDF format</strong> and let Azure GPT-4 analyze it for you!
            </p>
          </div>

          {/* Upload Section */}
          <div className="mb-8">
            <label className="block mb-4">
              <div className="border-2 border-dashed border-indigo-300 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer bg-indigo-50">
                <Upload className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
                <p className="text-gray-700 font-medium mb-2">
                  {file ? file.name : 'Click to upload PDF resume'}
                </p>
                <p className="text-sm text-gray-500">
                  PDF files only
                </p>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,application/pdf"
                  className="hidden"
                />
              </div>
            </label>

            <button
              onClick={parseAndAnalyze}
              disabled={!file || parsing || !pdfLoaded}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {parsing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing with Azure GPT...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  Parse PDF & Analyze with AI
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mb-6">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Parsed Text Preview */}
          {/* {parsedText && !analysis && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Extracted Text Preview</h3>
              <div className="text-gray-700 text-sm max-h-60 overflow-y-auto whitespace-pre-wrap font-mono bg-white p-4 rounded border">
                {parsedText.substring(0, 1000)}{parsedText.length > 1000 ? '...' : ''}
              </div>
              <p className="text-xs text-gray-500 mt-2">Total characters: {parsedText.length}</p>
            </div>
          )} */}

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-800">Analysis Complete</h2>
              </div>

              {/* Personal Info */}
              {(analysis.name || analysis.email || analysis.phone || analysis.location) && (
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
                  </div>
                  <div className="space-y-2">
                    {analysis.name && (
                      <p className="text-gray-700"><span className="font-semibold">Name:</span> {analysis.name}</p>
                    )}
                    {analysis.email && (
                      <p className="text-gray-700 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {analysis.email}
                      </p>
                    )}
                    {analysis.phone && (
                      <p className="text-gray-700 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {analysis.phone}
                      </p>
                    )}
                    {analysis.location && (
                      <p className="text-gray-700 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {analysis.location}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Summary */}
              {analysis.summary && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Professional Summary</h3>
                  <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
                </div>
              )}

              {/* Overall Score */}
              {analysis.overallScore && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6 text-green-600" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">Overall Score</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="text-3xl font-bold text-green-600">{analysis.overallScore}/10</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-green-600 h-3 rounded-full transition-all"
                            style={{ width: `${analysis.overallScore * 10}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Skills */}
              {analysis.skills && analysis.skills.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.skills.map((skill, idx) => (
                      <span key={idx} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
{analysis.projects && analysis.projects.length > 0 && (
  <div className="bg-white border border-gray-200 rounded-xl p-6">
    <div className="flex items-center gap-2 mb-4">
      <FileText className="w-5 h-5 text-indigo-600" />
      <h3 className="text-lg font-semibold text-gray-800">Projects</h3>
    </div>
    <div className="space-y-4">
      {analysis.projects.map((project, idx) => (
        <div key={idx} className="border-l-4 border-purple-600 pl-4 py-2">
          <h4 className="font-semibold text-gray-800">{project.name}</h4>
          {project.description && (
            <p className="text-gray-700 text-sm mt-2">{project.description}</p>
          )}
          {project.technologies && project.technologies.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {project.technologies.map((tech, techIdx) => (
                <span key={techIdx} className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs font-medium">
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
)}

              {/* Experience */}
              {analysis.experience && analysis.experience.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Briefcase className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Experience</h3>
                  </div>
                  <div className="space-y-4">
                    {analysis.experience.map((exp, idx) => (
                      <div key={idx} className="border-l-4 border-indigo-600 pl-4 py-2">
                        <h4 className="font-semibold text-gray-800">{exp.position}</h4>
                        <p className="text-gray-600 text-sm">{exp.company} • {exp.duration}</p>
                        {exp.responsibilities && (
                          <p className="text-gray-700 text-sm mt-2">{exp.responsibilities}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {analysis.education && analysis.education.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Education</h3>
                  </div>
                  <div className="space-y-3">
                    {analysis.education.map((edu, idx) => (
                      <div key={idx}>
                        <h4 className="font-semibold text-gray-800">{edu.degree}</h4>
                        <p className="text-gray-600 text-sm">{edu.institution} • {edu.duration}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {analysis.certifications && analysis.certifications.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.certifications.map((cert, idx) => (
                      <span key={idx} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths */}
              {analysis.strengths && analysis.strengths.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {analysis.strengths.map((strength, idx) => (
                      <li key={idx} className="text-gray-700 flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {analysis.improvements && analysis.improvements.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Areas for Improvement</h3>
                  <ul className="space-y-2">
                    {analysis.improvements.map((improvement, idx) => (
                      <li key={idx} className="text-gray-700 flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">→</span>
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeParser;