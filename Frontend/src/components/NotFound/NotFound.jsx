import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-4xl font-bold text-red-600 mb-4">404 - Page Not Found</h1>
      <p className="mb-6 text-gray-600">The page you are looking for doesn’t exist or has been moved.</p>
      <Link to="/home" className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-500">
        Back to Home
      </Link>
    </div>
  );
}
