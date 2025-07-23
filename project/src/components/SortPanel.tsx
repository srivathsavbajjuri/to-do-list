import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaSort, FaSortAlphaDown, FaSortAlphaUp, FaCalendarAlt, FaFlag } from 'react-icons/fa';
import { SortOption, SortDirection } from '../types';
import { useTaskStore } from '../store/taskStore';

interface SortPanelProps {
  onClose: () => void;
}

interface SortOptionConfig {
  label: string;
  icon: React.ReactNode;
}

const sortOptions: Record<SortOption, SortOptionConfig> = {
  dueDate: {
    label: 'Due Date',
    icon: <FaCalendarAlt />,
  },
  priority: {
    label: 'Priority',
    icon: <FaFlag />,
  },
  createdAt: {
    label: 'Creation Date',
    icon: <FaSort />,
  },
  alphabetical: {
    label: 'Alphabetical',
    icon: <FaSortAlphaDown />,
  },
};

const SortPanel: React.FC<SortPanelProps> = ({ onClose }) => {
  const { sortOptions, setSortOptions } = useTaskStore();
  
  const handleSortByChange = (sortBy: SortOption) => {
    setSortOptions({ sortBy });
  };
  
  const toggleSortDirection = () => {
    const newDirection: SortDirection = sortOptions.direction === 'asc' ? 'desc' : 'asc';
    setSortOptions({ direction: newDirection });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-card p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Sort Tasks</h2>
        <button 
          className="text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <FaTimes />
        </button>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sort By
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(Object.keys(sortOptions) as SortOption[]).map((option) => (
            <button
              key={option}
              onClick={() => handleSortByChange(option)}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                sortOptions.sortBy === option
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {sortOptions[option].icon}
              {sortOptions[option].label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Direction
        </label>
        <button
          onClick={toggleSortDirection}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-800 w-full"
        >
          {sortOptions.direction === 'asc' ? (
            <>
              <FaSortAlphaDown />
              <span>Ascending (A → Z, Oldest → Newest, Low → High)</span>
            </>
          ) : (
            <>
              <FaSortAlphaUp />
              <span>Descending (Z → A, Newest → Oldest, High → Low)</span>
            </>
          )}
        </button>
      </div>
      
      <div className="mt-6 flex justify-end">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="button-primary"
          onClick={onClose}
        >
          Apply Sorting
        </motion.button>
      </div>
    </div>
  );
};

export default SortPanel;