import { Link } from 'react-router-dom';

function Unauthorized() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">Unauthorized Access</h1>
                <p className="text-gray-600 mb-8">You don't have permission to access this page.</p>
                <Link
                    to="/"
                    className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
                >
                    Return to Home
                </Link>
            </div>
        </div>
    );
}

export default Unauthorized; 