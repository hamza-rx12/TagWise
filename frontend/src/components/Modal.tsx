import React from 'react';

interface ModalProps {
    onClose: () => void;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ onClose, children }) => {
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4 text-center">
                <div
                    className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 w-full max-w-4xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Content */}
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal; 