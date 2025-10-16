import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock the API service
jest.mock('../services/api', () => ({
  cashRegisterAPI: {
    calculateChange: jest.fn(),
    getSupportedLocales: jest.fn(),
    healthCheck: jest.fn(),
  },
  API_BASE_URL: 'http://localhost:8000',
}));

describe('App Component', () => {
  test('renders cash register title', () => {
    render(<App />);
    const titleElement = screen.getByText(/Cash Register/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders tab navigation', () => {
    render(<App />);
    // Find buttons by their text content
    const buttons = screen.getAllByRole('button');
    const fileTab = buttons.find(btn => btn.textContent === 'File Processing');
    const singleTab = buttons.find(btn => btn.textContent === 'Single Transaction');
    
    expect(fileTab).toBeTruthy();
    expect(singleTab).toBeTruthy();
  });

  test('shows file processing tab by default', () => {
    render(<App />);
    // File processing tab should be active by default
    // Look for the "File Processing" heading in the main content area
    const fileProcessingHeading = screen.getAllByText('File Processing').find(
      el => el.tagName.toLowerCase() === 'h2'
    );
    expect(fileProcessingHeading).toBeInTheDocument();
    
    // Verify we can see the file upload input
    const fileInput = screen.getByLabelText(/Select File/i);
    expect(fileInput).toBeInTheDocument();
  });
});
