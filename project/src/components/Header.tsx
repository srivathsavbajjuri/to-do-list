import React from 'react';
import { motion } from 'framer-motion';
import { FaClipboardCheck } from 'react-icons/fa';

const Header: React.FC = () => {
  return (
    <header className="bg-white bg-opacity-90 shadow-sm backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <div className="flex justify-between items-center">
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FaClipboardCheck className="text-primary-500 text-3xl" />
            <h1 className="text-2xl font-bold text-gray-800">
              Task<span className="text-primary-500">Flow</span>
            </h1>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className="text-sm text-gray-500">Organize your life, one task at a time</p>
          </motion.div>
        </div>
      </div>
    </header>
  );
};

export default Header;