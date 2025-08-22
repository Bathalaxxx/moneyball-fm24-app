import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'green', 
  text = null, 
  fullScreen = false,
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8', 
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  const colorClasses = {
    green: 'border-green-600',
    blue: 'border-blue-600',
    white: 'border-white',
    gray: 'border-gray-600'
  };

  const spinnerClass = `${sizeClasses[size]} border-4 border-gray-200 border-t-${colorClasses[color].split('-')[1]}-600 rounded-full animate-spin`;

  const content = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={spinnerClass}></div>
      {text && (
        <p className={`mt-4 text-sm font-medium ${
          color === 'white' ? 'text-white' : 'text-gray-600'
        }`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

const LoadingProgress = ({ 
  progress = 0, 
  text = 'Loading...', 
  subtext = null,
  showPercentage = true 
}) => {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{text}</span>
        {showPercentage && (
          <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
        )}
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className="bg-green-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        ></div>
      </div>
      
      {subtext && (
        <p className="text-xs text-gray-500 text-center">{subtext}</p>
      )}
    </div>
  );
};

const LoadingCard = ({ title, children, isLoading = false }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner text="Loading..." />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

const LoadingOverlay = ({ isVisible, text = 'Processing...', children }) => {
  if (!isVisible) return children;

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center rounded-lg">
        <LoadingSpinner size="large" text={text} />
      </div>
    </div>
  );
};

const SkeletonLoader = ({ className = '', lines = 3, animate = true }) => {
  const baseClass = `bg-gray-200 rounded ${animate ? 'animate-pulse' : ''}`;
  
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <div 
          key={i}
          className={`${baseClass} h-4`}
          style={{ 
            width: i === lines - 1 ? '70%' : '100%' 
          }}
        />
      ))}
    </div>
  );
};

// Football-themed loading animation
const FootballLoader = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'text-2xl',
    medium: 'text-4xl',
    large: 'text-6xl'
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`${sizeClasses[size]} animate-bounce`}>
        ⚽
      </div>
      <div className="mt-2 text-sm text-gray-600 animate-pulse">
        Analyzing player data...
      </div>
    </div>
  );
};

// Pyodide-specific loading component
const PyodideLoader = ({ currentStep, totalSteps, stepText }) => {
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center mb-4">
        <div className="text-2xl mr-3">🐍</div>
        <div>
          <h3 className="text-lg font-semibold text-blue-900">
            Initializing Python Environment
          </h3>
          <p className="text-sm text-blue-700">
            Loading data processing capabilities...
          </p>
        </div>
      </div>
      
      <LoadingProgress 
        progress={progress}
        text={stepText}
        subtext="This may take a moment on first load"
      />
      
      <div className="mt-4 text-xs text-blue-600">
        <div className="flex justify-between mb-1">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
      </div>
    </div>
  );
};

export {
  LoadingSpinner,
  LoadingProgress,
  LoadingCard,
  LoadingOverlay,
  SkeletonLoader,
  FootballLoader,
  PyodideLoader
};

export default LoadingSpinner;