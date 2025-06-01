import React from 'react';

interface Dataset {
    id: number;
    name: string;
    description: string;
    completionPercentage: number;
}

interface DatasetCardProps {
    dataset: Dataset;
    onViewDetails: (dataset: Dataset) => void;
    onViewAnnotators: (dataset: Dataset) => void;
    onAssignAnnotators: (dataset: Dataset) => void;
}

const DatasetCard: React.FC<DatasetCardProps> = ({
    dataset,
    onViewDetails,
    onViewAnnotators,
    onAssignAnnotators,
}) => {
    return (
        <div
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900 truncate">{dataset.name}</h3>
                <span className="px-3 py-1 bg-gradient-to-r from-teal-100 to-teal-50 text-teal-800 rounded-full text-sm font-medium shadow-sm">
                    {dataset.completionPercentage.toFixed(1)}%
                </span>
            </div>

            <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div
                        className="bg-gradient-to-r from-teal-500 to-teal-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${dataset.completionPercentage}%` }}
                    ></div>
                </div>
                <p className="text-sm text-gray-500">
                    {dataset.completionPercentage.toFixed(1)}% complete
                </p>
            </div>

            <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                {dataset.description || 'No description available.'}
            </p>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                    onClick={() => onViewDetails(dataset)}
                    className="px-4 py-2 text-sm font-medium text-teal-600 hover:text-teal-800 transition-colors duration-200 flex items-center"
                >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Details
                </button>
                <button
                    onClick={() => onViewAnnotators(dataset)}
                    className="px-4 py-2 text-sm font-medium text-teal-600 hover:text-teal-800 transition-colors duration-200 flex items-center"
                >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    View Annotators
                </button>
                <button
                    onClick={() => onAssignAnnotators(dataset)}
                    className="px-4 py-2 text-sm font-medium text-teal-600 hover:text-teal-800 transition-colors duration-200 flex items-center"
                >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Assign
                </button>
            </div>
        </div>
    );
};

export default DatasetCard; 