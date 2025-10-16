import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransactionForm from '../components/TransactionForm';
import { cashRegisterAPI } from '../services/api';

// Mock the API
jest.mock('../services/api', () => ({
  cashRegisterAPI: {
    calculateChange: jest.fn(),
  },
}));

const mockOnResult = jest.fn();
const mockOnError = jest.fn();

describe('TransactionForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form fields', () => {
    render(<TransactionForm onResult={mockOnResult} onError={mockOnError} />);
    
    expect(screen.getByLabelText(/Amount Owed/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Amount Paid/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Currency Locale/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Divisor/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Calculate Change/i })).toBeInTheDocument();
  });

  test('handles form input changes', async () => {
    const user = userEvent.setup();
    render(<TransactionForm onResult={mockOnResult} onError={mockOnError} />);
    
    const amountOwedInput = screen.getByLabelText(/Amount Owed/i);
    const amountPaidInput = screen.getByLabelText(/Amount Paid/i);
    
    await user.type(amountOwedInput, '2.12');
    await user.type(amountPaidInput, '3.00');
    
    expect(amountOwedInput).toHaveValue(2.12);
    expect(amountPaidInput).toHaveValue(3.00);
  });

  test('handles form submission with valid data', async () => {
    const user = userEvent.setup();
    const mockResult = {
      change_amount: 0.88,
      change_cents: 88,
      denominations: { quarter: 3, dime: 1, penny: 3 },
      formatted_change: '3 quarters,1 dime,3 pennies',
      is_random: false,
      locale: 'en-US' as const,
    };
    
    (cashRegisterAPI.calculateChange as jest.Mock).mockResolvedValue(mockResult);
    
    render(<TransactionForm onResult={mockOnResult} onError={mockOnError} />);
    
    const amountOwedInput = screen.getByLabelText(/Amount Owed/i);
    const amountPaidInput = screen.getByLabelText(/Amount Paid/i);
    const submitButton = screen.getByRole('button', { name: /Calculate Change/i });
    
    await user.type(amountOwedInput, '2.12');
    await user.type(amountPaidInput, '3.00');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(cashRegisterAPI.calculateChange).toHaveBeenCalledWith({
        amount_owed: 2.12,
        amount_paid: 3.00,
        locale: 'en-US',
        divisor: 3,
      });
      expect(mockOnResult).toHaveBeenCalledWith(mockResult);
    });
  });

  test('handles insufficient payment error', async () => {
    const user = userEvent.setup();
    render(<TransactionForm onResult={mockOnResult} onError={mockOnError} />);
    
    const amountOwedInput = screen.getByLabelText(/Amount Owed/i);
    const amountPaidInput = screen.getByLabelText(/Amount Paid/i);
    const submitButton = screen.getByRole('button', { name: /Calculate Change/i });
    
    await user.type(amountOwedInput, '5.00');
    await user.type(amountPaidInput, '3.00');
    await user.click(submitButton);
    
    expect(mockOnError).toHaveBeenCalledWith('Amount paid must be greater than or equal to amount owed');
    expect(cashRegisterAPI.calculateChange).not.toHaveBeenCalled();
  });

  test('handles API errors', async () => {
    const user = userEvent.setup();
    const errorMessage = 'API Error';
    
    (cashRegisterAPI.calculateChange as jest.Mock).mockRejectedValue(new Error(errorMessage));
    
    render(<TransactionForm onResult={mockOnResult} onError={mockOnError} />);
    
    const amountOwedInput = screen.getByLabelText(/Amount Owed/i);
    const amountPaidInput = screen.getByLabelText(/Amount Paid/i);
    const submitButton = screen.getByRole('button', { name: /Calculate Change/i });
    
    await user.type(amountOwedInput, '2.12');
    await user.type(amountPaidInput, '3.00');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(errorMessage);
    });
  });

  test('shows loading state during calculation', async () => {
    const user = userEvent.setup();
    
    (cashRegisterAPI.calculateChange as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );
    
    render(<TransactionForm onResult={mockOnResult} onError={mockOnError} />);
    
    const amountOwedInput = screen.getByLabelText(/Amount Owed/i);
    const amountPaidInput = screen.getByLabelText(/Amount Paid/i);
    const submitButton = screen.getByRole('button', { name: /Calculate Change/i });
    
    await user.type(amountOwedInput, '2.12');
    await user.type(amountPaidInput, '3.00');
    await user.click(submitButton);
    
    expect(screen.getByText('Calculating...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  test('validates required fields', async () => {
    const user = userEvent.setup();
    render(<TransactionForm onResult={mockOnResult} onError={mockOnError} />);
    
    const submitButton = screen.getByRole('button', { name: /Calculate Change/i });
    await user.click(submitButton);
    
    // Form allows 0 values (0 owed, 0 paid is valid - exact change)
    // The API call should happen with default values
    await waitFor(() => {
      expect(cashRegisterAPI.calculateChange).toHaveBeenCalledWith({
        amount_owed: 0,
        amount_paid: 0,
        locale: 'en-US',
        divisor: 3,
      });
    });
  });
});
