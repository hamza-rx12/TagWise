// pages/AnnotatorSelection.tsx
import { useState, useEffect } from 'react';
import { authenticatedFetch } from '../../utils/api';

// Define the Annotator type
type Annotator = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  enabled: boolean;
};

function AnnotatorSelection() {
  const [annotators, setAnnotators] = useState<Annotator[]>([]);
  const [selectedAnnotators, setSelectedAnnotators] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch all annotators on component mount
  useEffect(() => {
    const fetchAnnotators = async () => {
      try {
        setIsLoading(true);
        const response = await authenticatedFetch('http://localhost:8080/api/v1/annotators');
        if (!response.ok) throw new Error('Failed to fetch annotators');
        const data = await response.json();
        setAnnotators(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching annotators:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnnotators();
  }, []);

  // Handle checkbox change
  const handleCheckboxChange = (id: string) => {
    setSelectedAnnotators((prev) => (prev.includes(id) ? prev.filter((annotatorId) => annotatorId !== id) : [...prev, id]));
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedAnnotators.length === filteredAnnotators.length) {
      setSelectedAnnotators([]);
      showNotification('All annotators unselected', 'success');
    } else {
      setSelectedAnnotators(filteredAnnotators.map((annotator) => annotator.id));
      showNotification(`Selected all ${filteredAnnotators.length} annotators`, 'success');
    }
  };

  // Handle submit selected annotators
  const handleSubmit = () => {
    console.log('Selected annotator IDs:', selectedAnnotators);
    const selected = annotators.filter((annotator) => selectedAnnotators.includes(annotator.id));
    console.log('Selected annotators:', selected);
    showNotification(`Successfully selected ${selectedAnnotators.length} annotators`, 'success');
  };

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Filter annotators based on search term
  const filteredAnnotators = annotators.filter((annotator) =>
    `${annotator.firstName} ${annotator.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get random color based on name (for avatar)
  const getAvatarColor = (firstName: string, lastName: string) => {
    const colors = [
      'bg-pink-500', 'bg-purple-500', 'bg-indigo-500', 'bg-blue-500', 'bg-teal-500', 'bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500',
    ];
    const textColors = [
      'text-pink-50', 'text-purple-50', 'text-indigo-50', 'text-blue-50', 'text-teal-50', 'text-green-50', 'text-yellow-50', 'text-orange-50', 'text-red-50',
    ];
    const nameHash = (firstName.charCodeAt(0) + lastName.charCodeAt(0)) % colors.length;
    return { bg: colors[nameHash], text: textColors[nameHash] };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 py-8 px-4 sm:px-6 lg:px-8">
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            } transform transition-all duration-500 animate-slideIn`}
        >
          <span className="mr-2">
            {notification.type === 'success' ? (
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </span>
          {notification.message}
        </div>
      )}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 mb-8 border border-white/50">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Select Annotators
          </h1>
          <p className="text-gray-600">Choose the annotators you want to assign to this task.</p>
        </div>
        <div className="mb-6 bg-white/80 backdrop-blur-md rounded-xl shadow-sm p-4 border border-white/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search annotators..."
                className="pl-10 pr-4 py-3 w-full sm:w-64 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleSelectAll}
                className="text-sm text-teal-600 hover:text-teal-800 font-medium px-4 py-2 rounded-lg hover:bg-teal-50 transition-colors duration-200"
              >
                {selectedAnnotators.length === filteredAnnotators.length && filteredAnnotators.length > 0 ? 'Unselect All' : 'Select All'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={selectedAnnotators.length === 0}
                className={`px-6 py-3 rounded-lg text-white font-medium flex items-center ${selectedAnnotators.length > 0
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                    : 'bg-gray-400 cursor-not-allowed'
                  } transition-all duration-200`}
              >
                <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Submit Selection ({selectedAnnotators.length})
              </button>
            </div>
          </div>
        </div>
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{error}</p>
            </div>
          </div>
        )}
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64 bg-white/80 backdrop-blur-md rounded-xl shadow-sm p-8 border border-white/50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500 mb-4"></div>
            <p className="text-gray-500 font-medium">Loading annotators...</p>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm overflow-hidden border border-white/50">
            {filteredAnnotators.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <svg className="mx-auto h-16 w-16 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 className="mt-2 text-xl font-medium text-gray-900">No annotators found</h3>
                <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
                  {searchTerm ? `No results for "${searchTerm}"` : 'There are no annotators available.'}
                </p>
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="mt-4 text-teal-600 hover:text-teal-800 font-medium">
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Full Name
                      </th>
                      <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Selection
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200">
                    {filteredAnnotators.map((annotator, index) => {
                      const avatarColor = getAvatarColor(annotator.firstName, annotator.lastName);
                      return (
                        <tr
                          key={annotator.id}
                          className={`hover:bg-teal-50/50 transition-colors ${selectedAnnotators.includes(annotator.id) ? 'bg-teal-50/70' : ''}`}
                          style={{ animationDelay: `${index * 0.05}s`, animation: 'fadeIn 0.5s ease-out forwards', opacity: 0 }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`flex-shrink-0 h-10 w-10 ${avatarColor.bg} rounded-full flex items-center justify-center shadow-sm`}>
                                <span className={`${avatarColor.text} font-medium`}>{annotator.firstName.charAt(0)}{annotator.lastName.charAt(0)}</span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {annotator.firstName} {annotator.lastName}
                                </div>
                                <div className="text-xs text-gray-500">{annotator.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                className="form-checkbox h-5 w-5 text-teal-600 rounded border-gray-300 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors duration-200"
                                checked={selectedAnnotators.includes(annotator.id)}
                                onChange={() => handleCheckboxChange(annotator.id)}
                              />
                              <span className="sr-only">Select {annotator.firstName} {annotator.lastName}</span>
                            </label>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {!isLoading && selectedAnnotators.length > 0 && (
          <div className="mt-6 bg-gradient-to-r from-teal-500/10 to-indigo-500/10 backdrop-blur-md border border-teal-200 rounded-xl p-6 shadow-sm transform transition-all duration-300 hover:shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-medium text-teal-800 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>{selectedAnnotators.length} {selectedAnnotators.length === 1 ? 'annotator' : 'annotators'} selected</span>
                </h3>
                <p className="text-sm text-teal-600 mt-1 ml-7">
                  {selectedAnnotators.length === annotators.length
                    ? 'All annotators are selected'
                    : `${((selectedAnnotators.length / annotators.length) * 100).toFixed(0)}% of total annotators`}
                </p>
              </div>
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Confirm Selection
              </button>
            </div>
            <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-indigo-500 transition-all duration-500 ease-out"
                style={{ width: `${(selectedAnnotators.length / annotators.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideIn { animation: slideIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}

export default AnnotatorSelection;