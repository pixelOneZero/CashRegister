import React from 'react';

interface FileResultsProps {
  results: string;
  onDownload: () => void;
}

const FileResults: React.FC<FileResultsProps> = ({ results, onDownload }) => {
  const isJson = results.trim().startsWith('{');
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">File Processing Results</h2>
        <button
          onClick={onDownload}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Download Results
        </button>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="mb-2">
          <span className="text-sm font-medium text-gray-600">Output Format:</span>
          <span className="text-sm text-gray-700">{isJson ? 'JSON (Detailed)' : 'Text (Simple)'}</span>
        </div>
        <div className="mb-4">
          <span className="text-sm font-medium text-gray-600">Results Length:</span>
          <span className="text-sm text-gray-700">{results.length} characters</span>
        </div>
        
        <div className="bg-white border rounded-lg p-4 max-h-96 overflow-y-auto">
          <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
            {results}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default FileResults;
