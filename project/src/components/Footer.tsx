import React from 'react';
import { FaHeart } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white bg-opacity-90 shadow-inner py-4 mt-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600 mb-2 md:mb-0">
            TaskFlow &copy; {new Date().getFullYear()} - Your beautiful task manager
          </p>
          <div className="flex items-center text-sm text-gray-600">
            <span>Made with</span>
            <FaHeart className="text-accent-500 mx-1" />
            <span>for productivity</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;