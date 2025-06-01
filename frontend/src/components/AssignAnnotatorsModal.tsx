import React, { useState } from 'react';
import Modal from './Modal';

interface Annotator {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    enabled: boolean;
    role: string;
}

interface Dataset {
    id: number;
    name: string;
}

interface AssignAnnotatorsModalProps {
    dataset: Dataset;
    annotators: Annotator[];
    isLoading: boolean;
    onClose: () => void;
    onAssignAnnotators: (annotatorIds: number[]) => Promise<void>;
}

const AssignAnnotatorsModal: React.FC<AssignAnnotatorsModalProps> = ({
    dataset,
    annotators,
    isLoading,
    onClose,
    onAssignAnnotators,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAnnotators, setSelectedAnnotators] = useState<string[]>([]);
    const [isAssigning, setIsAssigning] = useState(false);

    const filteredAnnotators = annotators.filter(annotator => {
        const searchLower = searchQuery.toLowerCase();
        return (
            annotator.firstName.toLowerCase().includes(searchLower) ||
            annotator.lastName.toLowerCase().includes(searchLower) ||
            annotator.email.toLowerCase().includes(searchLower)
        );
    });

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedAnnotators(filteredAnnotators.map(a => a.id.toString()));
        } else {
            setSelectedAnnotators([]);
        }
    };

    const handleAssignSelected = async () => {
        if (selectedAnnotators.length === 0) return;

        setIsAssigning(true);
        try {
            await onAssignAnnotators(selectedAnnotators.map(id => parseInt(id)));
            setSelectedAnnotators([]);
        } finally {
            setIsAssigning(false);
        }
    };

    return (
        <Modal onClose={onClose}>
            <div className="p-8 w-full max-w-4xl bg-gradient-to-br from-white to-gray-50 rounded-2xl">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent mb-3">Assign Unassigned Annotators</h2>
                    <p className="text-gray-600 text-lg">Select annotators to assign to {dataset.name}</p>
                </div>

                <div className="space-y-6">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
                            <p className="mt-6 text-gray-600 text-lg">Loading unassigned annotators...</p>
                        </div>
                    ) : annotators.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-16 w-16 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <h3 className="mt-4 text-xl font-medium text-gray-900">No unassigned annotators available</h3>
                            <p className="mt-2 text-gray-500 text-base">
                                All annotators have already been assigned to this dataset.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-100/50">
                                <div className="flex-1 max-w-2xl">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search annotators by name or email..."
                                            className="w-full px-5 py-3 pl-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-base shadow-sm"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        <svg
                                            className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 ml-6">
                                    <label className="flex items-center space-x-3 text-base text-gray-600">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-5 w-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                                            checked={selectedAnnotators.length === filteredAnnotators.length && filteredAnnotators.length > 0}
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                        />
                                        <span>Select All</span>
                                    </label>
                                    <span className="text-sm text-gray-500">
                                        {selectedAnnotators.length} selected
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100/50 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                                <div className="max-h-[600px] overflow-y-auto">
                                    <div className="grid grid-cols-2 gap-4 p-4">
                                        {filteredAnnotators.map((annotator) => (
                                            <div
                                                key={annotator.id}
                                                className="flex items-center px-6 py-4 hover:bg-gray-50/80 border border-gray-100 rounded-lg transition-all duration-200 hover:shadow-md"
                                            >
                                                <input
                                                    type="checkbox"
                                                    id={`annotator-${annotator.id}`}
                                                    className="form-checkbox h-5 w-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                                                    checked={selectedAnnotators.includes(annotator.id.toString())}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedAnnotators([...selectedAnnotators, annotator.id.toString()]);
                                                        } else {
                                                            setSelectedAnnotators(selectedAnnotators.filter(id => id !== annotator.id.toString()));
                                                        }
                                                    }}
                                                />
                                                <label
                                                    htmlFor={`annotator-${annotator.id}`}
                                                    className="ml-4 flex-1 cursor-pointer"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-base font-medium text-gray-900">
                                                                {annotator.firstName} {annotator.lastName}
                                                            </p>
                                                            <p className="text-sm text-gray-500 mt-0.5">{annotator.email}</p>
                                                        </div>
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-teal-100 to-teal-50 text-teal-800 shadow-sm">
                                                            {annotator.role}
                                                        </span>
                                                    </div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 text-base font-medium shadow-sm hover:shadow"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAssignSelected}
                            disabled={selectedAnnotators.length === 0 || isAssigning || annotators.length === 0 || isLoading}
                            className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-200 text-base font-medium shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                        >
                            {isAssigning ? 'Assigning...' : `Assign ${selectedAnnotators.length} Annotator${selectedAnnotators.length !== 1 ? 's' : ''}`}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default AssignAnnotatorsModal; 