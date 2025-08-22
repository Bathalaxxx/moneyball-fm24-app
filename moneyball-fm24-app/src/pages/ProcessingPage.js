import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ProgressStep = ({ step, currentStep, title, description, isComplete, isError }) => {
  const isActive = step === currentStep;
  const isPast = step < currentStep;
  
  return (
    <div className={`flex items-center space-x-4 p-4 rounded-lg ${
      isActive ? 'bg-blue-50 border-l-4 border-blue-400' : 
      isComplete ? 'bg-green-50 border-l-4 border-green-400' :
      isError ? 'bg-red-50 border-l-4 border-red-400' :
      'bg-gray-50'
    }`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
        isError ? 'bg-red-500 text-white' :
        isComplete ? 'bg-green-500 text-white' :
        isActive ? 'bg-blue-500 text-white' :
        'bg-gray-300 text-gray-600'
      }`}>
        {isError ? '❌' : isComplete ? '✅' : isActive ? '⏳' : step}
      </div>
      <div className="flex-1">
        <h3 className={`text-lg font-semibold ${
          isError ? 'text-red-900' :
          isComplete ? 'text-green-900' :
          isActive ? 'text-blue-900' :
          'text-gray-900'
        }`}>
          {title}
        </h3>
        <p className={`text-sm ${
          isError ? 'text-red-700' :
          isComplete ? 'text-green-700' :
          isActive ? 'text-blue-700' :
          'text-gray-600'
        }`}>
          {description}
        </p>
      </div>
    </div>
  );
};

const ProcessingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [pyodide, setPyodide] = useState(null);
  const [processingError, setProcessingError] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [excelBlob, setExcelBlob] = useState(null);

  const files = location.state?.files;

  useEffect(() => {
    if (!files) {
      navigate('/upload');
      return;
    }
    
    initializePyodide();
  }, [files, navigate]);

  const updateProgress = (step, progress) => {
    setCurrentStep(step);
    setProgress(progress);
  };

  const markStepComplete = (step) => {
    setCompletedSteps(prev => new Set([...prev, step]));
  };

  const initializePyodide = async () => {
    try {
      updateProgress(1, 10);
      
      // Load Pyodide
      const pyodideInstance = await window.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
      });
      
      updateProgress(1, 30);
      
      // Install required packages
      await pyodideInstance.loadPackage(["pandas", "numpy", "xlsxwriter"]);
      updateProgress(1, 60);
      
      // Install micropip and additional packages
      await pyodideInstance.loadPackage("micropip");
      const micropip = pyodideInstance.pyimport("micropip");
      await micropip.install("html5lib");
      
      updateProgress(1, 90);
      
      // Load our processing script
      const response = await fetch('/scripts/fm_processor.py');
      const scriptContent = await response.text();
      pyodideInstance.runPython(scriptContent);
      
      setPyodide(pyodideInstance);
      markStepComplete(1);
      updateProgress(2, 0);
      
      // Start processing
      processFiles(pyodideInstance);
      
    } catch (error) {
      console.error('Error initializing Pyodide:', error);
      setProcessingError(`Failed to initialize Python environment: ${error.message}`);
    }
  };

  const processFiles = async (pyodideInstance) => {
    try {
      updateProgress(2, 10);
      
      // Read file contents
      const signedContent = await files.signed.text();
      updateProgress(2, 30);
      
      const loansContent = await files.loans.text();
      updateProgress(2, 50);
      
      const universalContent = await files.universal.text();
      updateProgress(2, 70);
      
      markStepComplete(2);
      updateProgress(3, 0);
      
      // Process data with Python
      pyodideInstance.globals.set("signed_html", signedContent);
      pyodideInstance.globals.set("loans_html", loansContent);
      pyodideInstance.globals.set("universal_html", universalContent);
      
      updateProgress(3, 20);
      
      const result = pyodideInstance.runPython(`
        import js
        result_bytes = main(signed_html, loans_html, universal_html)
        result_bytes
      `);
      
      updateProgress(3, 90);
      
      // Convert Python bytes to JavaScript Blob
      const uint8Array = new Uint8Array(result.toJs());
      const blob = new Blob([uint8Array], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      setExcelBlob(blob);
      markStepComplete(3);
      updateProgress(4, 100);
      setShowEmailInput(true);
      
    } catch (error) {
      console.error('Error processing files:', error);
      setProcessingError(`Processing failed: ${error.message}`);
    }
  };

  const downloadExcel = () => {
    if (!excelBlob) return;
    
    const url = URL.createObjectURL(excelBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'FM24_Moneyball_Analysis.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const steps = [
    {
      step: 1,
      title: "Initializing Python Environment",
      description: "Loading Pyodide and required packages (pandas, numpy, xlsxwriter)"
    },
    {
      step: 2,
      title: "Reading Upload Files",
      description: "Processing your three FM24 HTML export files"
    },
    {
      step: 3,
      title: "Analyzing Player Data",
      description: "Calculating archetype ratings and league multipliers"
    },
    {
      step: 4,
      title: "Generating Excel Report",
      description: "Creating downloadable Excel file with player analytics"
    }
  ];

  if (!files) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600">No files to process. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Processing Your FM24 Data
        </h1>
        <p className="text-lg text-gray-600">
          Analyzing {Object.keys(files).length} files using advanced Moneyball analytics
        </p>
      </div>

      {/* Error Display */}
      {processingError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400 text-xl">❌</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Processing Error
              </h3>
              <p className="mt-2 text-sm text-red-700">{processingError}</p>
              <button
                onClick={() => navigate('/upload')}
                className="mt-3 text-sm font-medium text-red-800 hover:text-red-900 underline"
              >
                ← Go back to upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <div className="space-y-4 mb-8">
        {steps.map(({ step, title, description }) => (
          <ProgressStep
            key={step}
            step={step}
            currentStep={currentStep}
            title={title}
            description={description}
            isComplete={completedSteps.has(step)}
            isError={processingError && step === currentStep}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-200 rounded-full h-2 mb-8">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Email Input and Download */}
      {showEmailInput && excelBlob && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="mb-4">
            <span className="text-4xl">🎉</span>
            <h2 className="text-2xl font-bold text-green-900 mt-2">
              Analysis Complete!
            </h2>
            <p className="text-green-700 mt-2">
              Your FM24 Moneyball analysis is ready for download
            </p>
          </div>
          
          <div className="max-w-md mx-auto mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-green-900 mb-2">
              Email Address (Optional)
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <p className="text-xs text-green-600 mt-1">
              * We don't store or use your email. This is just for UI completion.
            </p>
          </div>
          
          <button
            onClick={downloadExcel}
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
          >
            <span className="mr-2">📊</span>
            Download Excel Report
          </button>
          
          <div className="mt-6 text-sm text-green-700">
            <h3 className="font-semibold mb-2">Your report includes:</h3>
            <ul className="space-y-1">
              <li>• Player Archetype Summary (Top 5% performers)</li>
              <li>• 7 detailed archetype sheets with ratings</li>
              <li>• League-adjusted performance metrics</li>
              <li>• Percentile rankings within each position</li>
            </ul>
          </div>
        </div>
      )}

      {/* Processing Info */}
      {!showEmailInput && !processingError && (
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            <span className="mr-2">⚡</span>Processing Information
          </h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>• Processing may take 30-60 seconds for large datasets</p>
            <p>• All calculations happen in your browser - no data leaves your device</p>
            <p>• We're analyzing player performance across 7 different archetypes</p>
            <p>• League multipliers are being applied for accurate cross-league comparisons</p>
          </div>
        </div>
      )}

      {/* File Info */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Files Being Processed</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(files).map(([type, file]) => (
            <div key={type} className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 capitalize">{type} Players</h4>
              <p className="text-sm text-gray-600 truncate">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProcessingPage;