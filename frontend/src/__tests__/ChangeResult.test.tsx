import React from 'react';
import { render, screen } from '@testing-library/react';
import ChangeResult from '../components/ChangeResult';
import { ChangeResponse } from '../types';

describe('ChangeResult Component', () => {
  const mockResult: ChangeResponse = {
    change_amount: 0.88,
    change_cents: 88,
    denominations: { quarter: 3, dime: 1, penny: 3 },
    formatted_change: '3 quarters,1 dime,3 pennies',
    is_random: false,
    locale: 'en-US',
  };

  test('renders change result information', () => {
    render(<ChangeResult result={mockResult} />);
    
    expect(screen.getByText('Change Result')).toBeInTheDocument();
    expect(screen.getByText('$0.88')).toBeInTheDocument();
    expect(screen.getByText('88 cents')).toBeInTheDocument();
    expect(screen.getByText('3 quarters,1 dime,3 pennies')).toBeInTheDocument();
  });

  test('shows optimal badge for non-random results', () => {
    render(<ChangeResult result={mockResult} />);
    
    expect(screen.getByText('Optimal denominations')).toBeInTheDocument();
    expect(screen.queryByText('Random Denominations')).not.toBeInTheDocument();
  });

  test('shows random badge for random results', () => {
    const randomResult = { ...mockResult, is_random: true };
    render(<ChangeResult result={randomResult} />);
    
    expect(screen.getByText('Random Denominations')).toBeInTheDocument();
    expect(screen.queryByText('Optimal denominations')).not.toBeInTheDocument();
  });

  test('displays denominations correctly', () => {
    render(<ChangeResult result={mockResult} />);
    
    expect(screen.getByText('quarter:')).toBeInTheDocument();
    expect(screen.getByText('dime:')).toBeInTheDocument();
    expect(screen.getByText('penny:')).toBeInTheDocument();
    // Check that denomination counts are displayed
    const spans = screen.getAllByText('3');
    expect(spans.length).toBeGreaterThan(0);
  });

  test('handles Euro currency', () => {
    const euroResult = { ...mockResult, locale: 'fr-FR' as const };
    render(<ChangeResult result={euroResult} />);
    
    expect(screen.getByText('€0.88')).toBeInTheDocument();
  });

  test('handles empty denominations', () => {
    const emptyResult = { ...mockResult, denominations: {} };
    render(<ChangeResult result={emptyResult} />);
    
    expect(screen.getByText('Change Result')).toBeInTheDocument();
    expect(screen.queryByText('Denominations:')).not.toBeInTheDocument();
  });

  test('displays calculation method information', () => {
    render(<ChangeResult result={mockResult} />);
    
    expect(screen.getByText(/Dynamic Programming \(Optimal\)/)).toBeInTheDocument();
    expect(screen.getByText(/Locale: en-US/)).toBeInTheDocument();
  });

  test('displays random calculation method', () => {
    const randomResult = { ...mockResult, is_random: true };
    render(<ChangeResult result={randomResult} />);
    
    expect(screen.getByText(/Random Generation/)).toBeInTheDocument();
  });
});
