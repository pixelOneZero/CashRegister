import React from 'react';
import { ChangeResponse } from '../types';

interface ChangeResultProps {
  result: ChangeResponse;
}

const ChangeResult: React.FC<ChangeResultProps> = ({ result }) => {
  const getCurrencySymbol = (locale: string) => {
    return locale === 'fr-FR' ? '€' : '$';
  };

  const getRandomBadge = () => {
    if (result.is_random) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
          Random Denominations
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
        Optimal denominations
      </span>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Change Result</h2>
        {getRandomBadge()}
      </div>
      
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="mb-2">
            <span className="text-sm font-medium text-gray-600">Change Amount:</span>
            <span className="text-lg font-bold text-gray-900">
              {getCurrencySymbol(result.locale)}{result.change_amount.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Change in Cents:</span>
            <span className="text-sm text-gray-700">{result.change_cents} cents</span>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Formatted Change:</h3>
          <p className="text-lg font-semibold text-blue-900">{result.formatted_change}</p>
        </div>

        {Object.keys(result.denominations).length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-800 mb-2">Denominations:</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(result.denominations).map(([denomination, count]) => (
                <div key={denomination} className="flex justify-between">
                  <span className="text-sm text-green-700 capitalize">{denomination}:</span>
                  <span className="text-sm font-medium text-green-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p>Locale: {result.locale}</p>
          <p>Calculation Method: {result.is_random ? 'Random Generation' : 'Dynamic Programming (Optimal)'}</p>
        </div>
      </div>
    </div>
  );
};

export default ChangeResult;
