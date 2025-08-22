// Error handling utilities for the Moneyball FM app

export const ErrorTypes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  FILE_VALIDATION_ERROR: 'FILE_VALIDATION_ERROR',
  PROCESSING_ERROR: 'PROCESSING_ERROR',
  PYODIDE_ERROR: 'PYODIDE_ERROR',
  BROWSER_COMPATIBILITY_ERROR: 'BROWSER_COMPATIBILITY_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

export const createError = (type, message, details = null) => ({
  type,
  message,
  details,
  timestamp: new Date().toISOString()
});

export const getErrorMessage = (error) => {
  const errorMessages = {
    [ErrorTypes.NETWORK_ERROR]: 'Network connection failed. Please check your internet connection and try again.',
    [ErrorTypes.FILE_VALIDATION_ERROR]: 'The uploaded file is invalid or corrupted. Please check that you\'ve exported the correct HTML file from FM24.',
    [ErrorTypes.PROCESSING_ERROR]: 'Error processing your FM24 data. Please ensure your files contain valid player statistics.',
    [ErrorTypes.PYODIDE_ERROR]: 'Python processing environment failed to initialize. Please refresh the page and try again.',
    [ErrorTypes.BROWSER_COMPATIBILITY_ERROR]: 'Your browser may not support all required features. Please try using a modern browser like Chrome, Firefox, or Safari.',
    [ErrorTypes.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again or refresh the page.'
  };

  return errorMessages[error.type] || error.message || errorMessages[ErrorTypes.UNKNOWN_ERROR];
};

export const getUserFriendlyError = (error) => {
  // Convert technical errors to user-friendly messages
  const message = error?.message?.toLowerCase() || '';
  
  if (message.includes('network') || message.includes('fetch')) {
    return createError(ErrorTypes.NETWORK_ERROR, 'Network connection failed');
  }
  
  if (message.includes('pyodide') || message.includes('python')) {
    return createError(ErrorTypes.PYODIDE_ERROR, 'Python environment initialization failed');
  }
  
  if (message.includes('file') || message.includes('html') || message.includes('parse')) {
    return createError(ErrorTypes.FILE_VALIDATION_ERROR, 'Invalid file format or content');
  }
  
  if (message.includes('webassembly') || message.includes('wasm')) {
    return createError(ErrorTypes.BROWSER_COMPATIBILITY_ERROR, 'Browser compatibility issue');
  }
  
  if (message.includes('processing') || message.includes('analysis')) {
    return createError(ErrorTypes.PROCESSING_ERROR, 'Data processing failed');
  }
  
  return createError(ErrorTypes.UNKNOWN_ERROR, error.message || 'Unknown error occurred');
};

export const validateBrowserCompatibility = () => {
  const checks = {
    webAssembly: typeof WebAssembly !== 'undefined',
    es6: typeof Symbol !== 'undefined',
    fetch: typeof fetch !== 'undefined',
    promises: typeof Promise !== 'undefined',
    arrayBuffer: typeof ArrayBuffer !== 'undefined',
    fileReader: typeof FileReader !== 'undefined'
  };
  
  const failed = Object.entries(checks)
    .filter(([_, supported]) => !supported)
    .map(([feature]) => feature);
    
  if (failed.length > 0) {
    return createError(
      ErrorTypes.BROWSER_COMPATIBILITY_ERROR,
      `Your browser is missing required features: ${failed.join(', ')}. Please use a modern browser.`,
      { missingFeatures: failed }
    );
  }
  
  return null;
};

export const validateFile = (file) => {
  const errors = [];
  
  if (!file) {
    errors.push('No file provided');
    return errors;
  }
  
  // Check file type
  if (!file.name.toLowerCase().endsWith('.html')) {
    errors.push('File must be an HTML file (.html)');
  }
  
  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    errors.push(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the 10MB limit`);
  }
  
  // Check minimum file size (should contain some data)
  if (file.size < 1000) {
    errors.push('File appears to be empty or too small to contain FM24 data');
  }
  
  return errors;
};

export const validateFileContent = async (file) => {
  try {
    const content = await file.text();
    const errors = [];
    
    // Check for HTML structure
    if (!content.includes('<html') && !content.includes('<table')) {
      errors.push('File does not appear to be a valid HTML export from FM24');
    }
    
    // Check for FM24-specific content
    const requiredElements = ['<table', '<tbody', '<tr'];
    const missingElements = requiredElements.filter(element => 
      !content.includes(element)
    );
    
    if (missingElements.length > 0) {
      errors.push('File does not contain expected FM24 table structure');
    }
    
    // Check for minimum data size
    if (content.length < 5000) {
      errors.push('File content appears too small to contain meaningful player data');
    }
    
    // Check for player data indicators
    const playerDataIndicators = ['Name', 'Position', 'Age', 'Club'];
    const foundIndicators = playerDataIndicators.filter(indicator =>
      content.includes(indicator)
    );
    
    if (foundIndicators.length < 2) {
      errors.push('File does not appear to contain player data from FM24');
    }
    
    return errors;
  } catch (error) {
    return ['Failed to read file content: ' + error.message];
  }
};

export const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw getUserFriendlyError(error);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
};

export const logError = (error, context = {}) => {
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Application Error:', {
      error,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }
  
  // In production, you might want to send to an error tracking service
  // Example: Sentry, LogRocket, etc.
};

export const createNotification = (type, title, message, duration = 5000) => ({
  id: Math.random().toString(36).substr(2, 9),
  type, // 'success', 'error', 'warning', 'info'
  title,
  message,
  duration,
  timestamp: Date.now()
});

// Browser feature detection
export const detectBrowserFeatures = () => {
  const features = {
    webAssembly: !!window.WebAssembly,
    serviceWorker: 'serviceWorker' in navigator,
    webWorkers: !!window.Worker,
    fileApi: !!(window.File && window.FileReader && window.FileList && window.Blob),
    dragAndDrop: 'draggable' in document.createElement('div'),
    localStorage: (() => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch {
        return false;
      }
    })(),
    es6Support: (() => {
      try {
        eval('class Test {}; const test = () => {}; let x = 1;');
        return true;
      } catch {
        return false;
      }
    })()
  };
  
  return features;
};

export const getSystemInfo = () => ({
  userAgent: navigator.userAgent,
  platform: navigator.platform,
  language: navigator.language,
  cookieEnabled: navigator.cookieEnabled,
  onLine: navigator.onLine,
  screen: {
    width: screen.width,
    height: screen.height,
    colorDepth: screen.colorDepth
  },
  viewport: {
    width: window.innerWidth,
    height: window.innerHeight
  },
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  features: detectBrowserFeatures()
});