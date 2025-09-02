'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface DebugModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export default function DebugModal({ isOpen, onClose, user }: DebugModalProps) {
  const [testResult, setTestResult] = useState('');

  const testAPI = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      setTestResult(`Token: ${token ? 'Present' : 'Missing'}\n`);
      
      if (!token) {
        setTestResult(prev => prev + 'No token found');
        return;
      }

      const response = await fetch(`http://localhost:3005/api/users/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: user?.firstName,
          lastName: user?.lastName,
          role: user?.role
        })
      });

      setTestResult(prev => prev + `Status: ${response.status}\n`);
      
      if (response.ok) {
        const data = await response.json();
        setTestResult(prev => prev + `Success: ${JSON.stringify(data, null, 2)}`);
      } else {
        const errorData = await response.json();
        setTestResult(prev => prev + `Error: ${JSON.stringify(errorData, null, 2)}`);
      }
    } catch (error) {
      setTestResult(prev => prev + `Exception: ${error}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Debug Information</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">User Data:</h4>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
              
              <button
                onClick={testAPI}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Test API Call
              </button>
              
              {testResult && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Test Result:</h4>
                  <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto whitespace-pre-wrap">
                    {testResult}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
