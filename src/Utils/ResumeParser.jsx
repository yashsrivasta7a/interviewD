import React, { useState, useEffect } from 'react';
import { Upload, FileText, Loader2, XCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ResumeParser = ({ onAnalysisComplete }) => {
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parsedText, setParsedText] = useState('');
  const [error, setError] = useState('');
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const navigate = useNavigate();

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

    try {
      // Extract text from PDF
      const extractedText = await extractTextFromPDF(file);
      
      if (!extractedText || extractedText.trim().length === 0) {
        setError('No text content found in the PDF');
        setParsing(false);
        return;
      }

      // Analyze with Azure GPT - don't set parsedText until this completes
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
      "technologies": ["Tech1", "Tech2"]
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
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Analyze this resume and return structured JSON:\n\n${resumeText}` }
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

        // Store the analysis in localStorage
        localStorage.setItem('resumeAnalysis', JSON.stringify(analysisData));

        // Notify parent component that analysis is complete
        if (onAnalysisComplete) {
          onAnalysisComplete(analysisData);
        }

        // Show simple success message
        setParsedText('SUCCESS');
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
    <div className="max-w-4xl mx-auto">
      <div>
        {!pdfLoaded && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">Loading PDF library...</p>
          </div>
        )}

        {/* Upload Section */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Upload Resume (PDF)
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF files only</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
              />
            </label>
          </div>
          {file && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-700 font-medium">{file.name}</span>
            </div>
          )}
        </div>

        <button
          onClick={parseAndAnalyze}
          disabled={!file || parsing || !pdfLoaded}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {parsing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing with Azure GPT...
            </>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              Parse PDF & Analyze with AI
            </>
          )}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {parsedText && !error && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-green-700 font-medium">Resume parsed successfully! ✅</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeParser;