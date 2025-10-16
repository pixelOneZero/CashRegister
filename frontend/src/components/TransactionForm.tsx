import React, { useState } from 'react';
import { ChangeRequest, ChangeResponse } from '../types';
import { cashRegisterAPI } from '../services/api';

interface TransactionFormProps {
  onResult: (result: ChangeResponse) => void;
  onError: (error: string) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onResult, onError }) => {
  const [formData, setFormData] = useState<ChangeRequest>({
    amount_owed: 0,
    amount_paid: 0,
    locale: 'en-US',
    divisor: 3,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount_owed' || name === 'amount_paid' || name === 'divisor' 
        ? (value === '' ? 0 : parseFloat(value) || 0)
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.amount_paid < formData.amount_owed) {
      onError('Amount paid must be greater than or equal to amount owed');
      return;
    }

    setIsLoading(true);
    try {
      const result = await cashRegisterAPI.calculateChange(formData);
      onResult(result);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Calculate Change</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="amount_owed" className="block text-sm font-medium text-gray-700 mb-1">
              Amount Owed ($)
            </label>
            <input
              type="number"
              id="amount_owed"
              name="amount_owed"
              value={formData.amount_owed === 0 ? '' : formData.amount_owed}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label htmlFor="amount_paid" className="block text-sm font-medium text-gray-700 mb-1">
              Amount Paid ($)
            </label>
            <input
              type="number"
              id="amount_paid"
              name="amount_paid"
              value={formData.amount_paid === 0 ? '' : formData.amount_paid}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="locale" className="block text-sm font-medium text-gray-700 mb-1">
              Currency Locale
            </label>
            <select
              id="locale"
              name="locale"
              value={formData.locale}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              name="divisor"
              value={formData.divisor}
              onChange={handleInputChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Calculating...' : 'Calculate Change'}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
