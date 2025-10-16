import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock the API service
jest.mock('../services/api', () => ({
  API_BASE_URL: 'http://localhost:8000',
}));

describe('App Component', () => {
  test('renders cash register title', () => {
    render(<App />);
    const titleElement = screen.getByText(/Cash Register/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders file processing interface', () => {
    render(<App />);
    
    // Look for the "File Processing" heading
    const fileProcessingHeading = screen.getByRole('heading', { name: /File Processing/i });
    expect(fileProcessingHeading).toBeInTheDocument();
    
    // Verify we can see the file upload input
    const fileInput = screen.getByLabelText(/Select File/i);
    expect(fileInput).toBeInTheDocument();
    
    // Verify we have the process button
    const processButton = screen.getByRole('button', { name: /Process File/i });
    expect(processButton).toBeInTheDocument();
  });

  test('renders sample file download button', () => {
    render(<App />);
    const downloadButton = screen.getByRole('button', { name: /Download Sample File/i });
    expect(downloadButton).toBeInTheDocument();
  });
});
