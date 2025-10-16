import React, { useState } from 'react';
import { API_BASE_URL } from '../services/api';

interface FileProcessorProps {
  onResults: (results: string) => void;
  onError: (error: string) => void;
}

const FileProcessor: React.FC<FileProcessorProps> = ({ onResults, onError }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [locale, setLocale] = useState<'en-US' | 'fr-FR'>('en-US');
  const [divisor, setDivisor] = useState(3);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMode, setProcessingMode] = useState<'simple' | 'detailed'>('simple');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleProcessFile = async () => {
    if (!selectedFile) {
      onError('Please select a file first');
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('locale', locale);
      formData.append('divisor', divisor.toString());

      const apiUrl = API_BASE_URL;
      let response;
      if (processingMode === 'simple') {
        response = await fetch(`${apiUrl}/process-file`, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.text();
        onResults(result);
      } else {
        response = await fetch(`${apiUrl}/process-file-detailed`, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        onResults(JSON.stringify(result, null, 2));
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResults = (results: string) => {
    const blob = new Blob([results], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `change_results_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const createSampleFile = () => {
    const sampleContent = `2.12,3.00
1.97,2.00
3.33,5.00
1.50,1.50
5.00,10.00`;
    
    const blob = new Blob([sampleContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_transactions.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">File Processing</h2>
      
      {/* File Format Instructions */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-medium text-blue-800 mb-2">File Format</h3>
        <p className="text-sm text-blue-700 mb-2">
          Upload a text file with one transaction per line in the format:
        </p>
        <code className="block text-sm bg-blue-100 p-2 rounded mb-2">
          amount_owed,amount_paid
        </code>
        <p className="text-sm text-blue-700 mb-2">Example:</p>
        <code className="block text-sm bg-blue-100 p-2 rounded">
          2.12,3.00<br/>
          1.97,2.00<br/>
          3.33,5.00
        </code>
        <button
          onClick={createSampleFile}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Download Sample File
        </button>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
          Select File
        </label>
        <input
          type="file"
          id="file-upload"
          accept=".txt,.csv"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {selectedFile && (
          <p className="mt-2 text-sm text-gray-600">
            Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      {/* Processing Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label htmlFor="locale" className="block text-sm font-medium text-gray-700 mb-1">
            Currency Locale
          </label>
          <select
            id="locale"
            value={locale}
            onChange={(e) => setLocale(e.target.value as 'en-US' | 'fr-FR')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="en-US">US Dollar (en-US)</option>
            <option value="fr-FR">Euro (fr-FR)</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="divisor" className="block text-sm font-medium text-gray-700 mb-1">
            Divisor
          </label>
          <input
            type="number"
            id="divisor"
            value={divisor}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '') {
                setDivisor(3); // Reset to default when cleared
              } else {
                const parsed = parseInt(value);
                if (!isNaN(parsed) && parsed >= 1) {
                  setDivisor(parsed);
                }
              }
            }}
            min="1"
            placeholder="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        
        <div>
          <label htmlFor="mode" className="block text-sm font-medium text-gray-700 mb-1">
            Output Mode
          </label>
          <select
            id="mode"
            value={processingMode}
            onChange={(e) => setProcessingMode(e.target.value as 'simple' | 'detailed')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="simple">Simple (formatted change only)</option>
            <option value="detailed">Detailed (JSON with metadata)</option>
          </select>
        </div>
      </div>

      {/* Process Button */}
      <div className="flex gap-3">
        <button
          onClick={handleProcessFile}
          disabled={!selectedFile || isProcessing}
          className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : 'Process File'}
        </button>
      </div>
    </div>
  );
};

export default FileProcessor;
