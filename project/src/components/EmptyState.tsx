import React from 'react';
import { motion } from 'framer-motion';
import { FaClipboardList, FaPlus } from 'react-icons/fa';

interface EmptyStateProps {
  onAddTask: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddTask }) => {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-16 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-primary-50 rounded-full p-6 mb-4">
        <FaClipboardList className="text-primary-500 text-5xl" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">No tasks found</h2>
      <p className="text-gray-600 max-w-md mb-6">
        You don't have any tasks yet, or your current filters don't match any tasks.
      </p>
      <button 
        className="button-primary flex items-center gap-2"
        onClick={onAddTask}
      >
        <FaPlus /> Add Your First Task
      </button>
    </motion.div>
  );
};

export default EmptyState;