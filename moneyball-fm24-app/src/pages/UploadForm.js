import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const FileUploadZone = ({ 
  title, 
  description, 
  file, 
  onFileSelect, 
  accept = ".html", 
  bgColor = "bg-gray-50",
  borderColor = "border-gray-300" 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      onFileSelect(droppedFiles[0]);
    }
  }, [onFileSelect]);

  const handleFileChange = useCallback((e) => {
    if (e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  }, [onFileSelect]);

  return (
    <div className={`border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ${
      isDragOver 
        ? 'border-blue-400 bg-blue-50' 
        : file 
          ? 'border-green-400 bg-green-50' 
          : `${borderColor} ${bgColor} hover:border-gray-400`
    }`}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="text-center"
      >
        <div className="mb-4">
          {file ? (
            <span className="text-4xl">✅</span>
          ) : (
            <span className="text-4xl text-gray-400">📁</span>
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        
        {file ? (
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <p className="text-sm font-medium text-green-800">
              📄 {file.name}
            </p>
            <p className="text-xs text-green-600">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div>
            <label className="cursor-pointer">
              <input
                type="file"
                accept={accept}
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
                Choose File
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-2">
              or drag and drop your HTML file here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const UploadForm = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState({
    signed: null,
    loans: null,
    universal: null
  });
  const [errors, setErrors] = useState([]);
  const [isValidating, setIsValidating] = useState(false);

  const validateFile = (file) => {
    const validations = [];
    
    // Check file type
    if (!file.name.toLowerCase().endsWith('.html')) {
      validations.push(`${file.name}: Must be an HTML file`);
    }
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      validations.push(`${file.name}: File size must be under 10MB`);
    }
    
    return validations;
  };

  const handleFileSelect = (type, file) => {
    const fileErrors = validateFile(file);
    
    if (fileErrors.length > 0) {
      setErrors(prev => [...prev.filter(e => !e.includes(file.name)), ...fileErrors]);
      return;
    }
    
    // Clear any previous errors for this file
    setErrors(prev => prev.filter(e => !e.includes(file.name)));
    
    setFiles(prev => ({
      ...prev,
      [type]: file
    }));
  };

  const validateAllFiles = async () => {
    setIsValidating(true);
    const allErrors = [];
    
    // Check all files are selected
    if (!files.signed) allErrors.push('Signed players HTML file is required');
    if (!files.loans) allErrors.push('Loans HTML file is required');
    if (!files.universal) allErrors.push('Universal players HTML file is required');
    
    // Validate file contents (basic check)
    for (const [type, file] of Object.entries(files)) {
      if (file) {
        try {
          const content = await file.text();
          if (!content.includes('<table') && !content.includes('<tbody')) {
            allErrors.push(`${file.name}: Does not appear to contain FM24 table data`);
          }
          if (content.length < 1000) {
            allErrors.push(`${file.name}: File seems too small to contain player data`);
          }
        } catch (error) {
          allErrors.push(`${file.name}: Error reading file content`);
        }
      }
    }
    
    setErrors(allErrors);
    setIsValidating(false);
    
    return allErrors.length === 0;
  };

  const handleSubmit = async () => {
    const isValid = await validateAllFiles();
    
    if (isValid) {
      // Navigate to processing page with files
      navigate('/processing', { 
        state: { 
          files: files 
        }
      });
    }
  };

  const resetFiles = () => {
    setFiles({
      signed: null,
      loans: null,
      universal: null
    });
    setErrors([]);
  };

  const allFilesUploaded = files.signed && files.loans && files.universal;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Upload Your FM24 Export Files
        </h1>
        <p className="text-lg text-gray-600">
          Upload the three HTML files exported from Football Manager 2024
        </p>
      </div>

      {/* Error Display */}
      {errors.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400 text-xl">❌</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Please fix the following issues:
              </h3>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Zones */}
      <div className="grid gap-6 mb-8">
        <FileUploadZone
          title="1. Signed Players (Transfers)"
          description="Upload the HTML file containing players available for transfer"
          file={files.signed}
          onFileSelect={(file) => handleFileSelect('signed', file)}
          bgColor="bg-blue-50"
          borderColor="border-blue-300"
        />
        
        <FileUploadZone
          title="2. Loan Players"
          description="Upload the HTML file containing players available on loan"
          file={files.loans}
          onFileSelect={(file) => handleFileSelect('loans', file)}
          bgColor="bg-orange-50"
          borderColor="border-orange-300"
        />
        
        <FileUploadZone
          title="3. Universal Players (All Players)"
          description="Upload the HTML file containing all players (no transfer restrictions)"
          file={files.universal}
          onFileSelect={(file) => handleFileSelect('universal', file)}
          bgColor="bg-purple-50"
          borderColor="border-purple-300"
        />
      </div>

      {/* Progress Indicator */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Progress</h3>
        <div className="flex items-center space-x-4">
          {[
            { label: 'Transfers', completed: !!files.signed },
            { label: 'Loans', completed: !!files.loans },
            { label: 'Universal', completed: !!files.universal }
          ].map((step, index) => (
            <div key={step.label} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step.completed 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step.completed ? '✓' : index + 1}
              </div>
              <span className={`ml-2 text-sm ${
                step.completed ? 'text-green-600 font-medium' : 'text-gray-500'
              }`}>
                {step.label}
              </span>
              {index < 2 && <div className="w-8 h-0.5 bg-gray-300 mx-4" />}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={resetFiles}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
          disabled={!allFilesUploaded}
        >
          Reset All Files
        </button>
        
        <button
          onClick={handleSubmit}
          disabled={!allFilesUploaded || isValidating}
          className={`px-8 py-3 text-base font-medium rounded-md transition-colors duration-200 ${
            allFilesUploaded && !isValidating
              ? 'text-white bg-green-600 hover:bg-green-700'
              : 'text-gray-500 bg-gray-200 cursor-not-allowed'
          }`}
        >
          {isValidating ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Validating...
            </span>
          ) : (
            <span className="flex items-center">
              <span className="mr-2">⚡</span>
              Process Files
            </span>
          )}
        </button>
      </div>

      {/* Help Text */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          <span className="mr-2">💡</span>Need Help?
        </h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p>• Make sure you've exported the files using our provided FM24 filter</p>
          <p>• Each HTML file should be exported from FM24 with different transfer status filters</p>
          <p>• Files should contain player data tables with statistics</p>
          <p>• If you encounter issues, try re-exporting from FM24 with the correct filter settings</p>
        </div>
      </div>
    </div>
  );
};

export default UploadForm;