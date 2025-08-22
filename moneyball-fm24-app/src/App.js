import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Instructions from './pages/Instructions';
import UploadForm from './pages/UploadForm';
import ProcessingPage from './pages/ProcessingPage';
import About from './pages/About';
import './App.css';

const Navigation = () => {
  const location = useLocation();
  
  const navLinks = [
    { path: '/', label: 'Instructions', icon: '📋' },
    { path: '/upload', label: 'Upload Files', icon: '📁' },
    { path: '/about', label: 'About', icon: 'ℹ️' }
  ];

  return (
    <nav className="bg-green-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <span className="text-2xl">⚽</span>
              <h1 className="text-xl font-bold">Moneyball: FM</h1>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {navLinks.map(({ path, label, icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  location.pathname === path
                    ? 'bg-green-700 text-green-100'
                    : 'text-green-100 hover:bg-green-700 hover:text-white'
                }`}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      
      <footer className="bg-green-800 text-green-100 py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">
            © 2024 Moneyball: FM. Powered by advanced analytics for Football Manager 2024.
          </p>
          <p className="text-xs mt-1 text-green-300">
            Process your FM24 exports into actionable player insights using Moneyball principles.
          </p>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Instructions />} />
          <Route path="/upload" element={<UploadForm />} />
          <Route path="/processing" element={<ProcessingPage />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;