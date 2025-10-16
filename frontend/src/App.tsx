import React, { useState } from 'react';
import FileProcessor from './components/FileProcessor';
import FileResults from './components/FileResults';

function App() {
  const [fileResults, setFileResults] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileResults = (results: string) => {
    setFileResults(results);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setFileResults(null);
  };

  const handleDownloadFileResults = () => {
    if (fileResults) {
      const blob = new Blob([fileResults], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `change_results_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cash Register</h1>
              <p className="text-gray-600">Change calculation with dynamic programming (DP) optimization, or random denomination strategy for a given divisor.</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* File Processing */}
        <div className="space-y-8">
          <FileProcessor onResults={handleFileResults} onError={handleError} />
          {fileResults && <FileResults results={fileResults} onDownload={handleDownloadFileResults} />}
        </div>
      </main>
    </div>
  );
}

export default App;
