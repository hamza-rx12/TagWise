import React from 'react';
import { Link } from 'react-router-dom';
import Modal from './Modal';

interface Dataset {
    id: number;
    name: string;
    description: string;
    completionPercentage: number;
}

interface DatasetDetailsModalProps {
    dataset: Dataset;
    onClose: () => void;
}

const DatasetDetailsModal: React.FC<DatasetDetailsModalProps> = ({ dataset, onClose }) => {
    return (
        <Modal onClose={onClose}>
            <div className="p-8 max-w-5xl w-full bg-gradient-to-br from-white to-gray-50 rounded-2xl">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent mb-3">{dataset.name}</h2>
                    <div className="flex items-center space-x-3">
                        <span className="px-4 py-1.5 bg-gradient-to-r from-teal-100 to-teal-50 text-teal-800 rounded-full text-sm font-medium shadow-sm">
                            {dataset.completionPercentage.toFixed(1)}% Complete
                        </span>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100/50 hover:shadow-xl transition-shadow">
                        <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Description
                        </h3>
                        <p className="text-gray-600 text-base leading-relaxed">
                            {dataset.description || 'No description available.'}
                        </p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100/50 hover:shadow-xl transition-shadow">
                        <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Progress
                        </h3>
                        <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                            <div
                                className="bg-gradient-to-r from-teal-500 to-teal-600 h-3 rounded-full transition-all duration-500 shadow-lg"
                                style={{ width: `${dataset.completionPercentage}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-gray-500 mt-3 flex items-center">
                            <svg className="w-4 h-4 mr-1.5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {dataset.completionPercentage.toFixed(1)}% of the dataset has been annotated
                        </p>
                    </div>

                    <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 text-base font-medium shadow-sm hover:shadow"
                        >
                            Close
                        </button>
                        <Link
                            to={`/admin/datasets/${dataset.id}/annotators`}
                            className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-200 text-base font-medium shadow-sm hover:shadow"
                            onClick={onClose}
                        >
                            Manage Annotators
                        </Link>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default DatasetDetailsModal; 