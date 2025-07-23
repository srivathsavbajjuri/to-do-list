import React from 'react';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import { FaTimes, FaRedo } from 'react-icons/fa';
import { TaskCategory, TaskPriority } from '../types';
import { useTaskStore } from '../store/taskStore';

interface FilterPanelProps {
  onClose: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onClose }) => {
  const { 
    filterOptions, 
    setFilterOptions, 
    resetFilters 
  } = useTaskStore();
  
  const handleCategoryToggle = (category: TaskCategory) => {
    const updatedCategories = filterOptions.categories.includes(category)
      ? filterOptions.categories.filter(c => c !== category)
      : [...filterOptions.categories, category];
    
    setFilterOptions({ categories: updatedCategories });
  };
  
  const handlePriorityToggle = (priority: TaskPriority) => {
    const updatedPriorities = filterOptions.priorities.includes(priority)
      ? filterOptions.priorities.filter(p => p !== priority)
      : [...filterOptions.priorities, priority];
    
    setFilterOptions({ priorities: updatedPriorities });
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterOptions({ searchTerm: e.target.value });
  };
  
  const handleCompletedToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterOptions({ showCompleted: e.target.checked });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-card p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Filter Tasks</h2>
        <div className="flex items-center gap-2">
          <button 
            className="flex items-center gap-1 text-primary-500 hover:text-primary-700"
            onClick={resetFilters}
          >
            <FaRedo size={14} /> Reset
          </button>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-4">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              className="input-primary"
              value={filterOptions.searchTerm}
              onChange={handleSearchChange}
              placeholder="Search tasks..."
            />
          </div>
          
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filterOptions.showCompleted}
                onChange={handleCompletedToggle}
                className="mr-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Show completed tasks</span>
            </label>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {(['work', 'personal', 'shopping', 'health', 'finance', 'other'] as TaskCategory[]).map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryToggle(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                    filterOptions.categories.includes(category)
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <div className="flex flex-wrap gap-2">
              {(['low', 'medium', 'high'] as TaskPriority[]).map((priority) => (
                <button
                  key={priority}
                  onClick={() => handlePriorityToggle(priority)}
                  className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                    filterOptions.priorities.includes(priority)
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <DatePicker
                  selected={filterOptions.dueDateRange.from}
                  onChange={(date) => setFilterOptions({ 
                    dueDateRange: { 
                      ...filterOptions.dueDateRange, 
                      from: date 
                    } 
                  })}
                  selectsStart
                  startDate={filterOptions.dueDateRange.from}
                  endDate={filterOptions.dueDateRange.to}
                  className="input-primary"
                  placeholderText="From"
                  dateFormat="MMM d, yyyy"
                  isClearable
                />
              </div>
              <div>
                <DatePicker
                  selected={filterOptions.dueDateRange.to}
                  onChange={(date) => setFilterOptions({ 
                    dueDateRange: { 
                      ...filterOptions.dueDateRange, 
                      to: date 
                    } 
                  })}
                  selectsEnd
                  startDate={filterOptions.dueDateRange.from}
                  endDate={filterOptions.dueDateRange.to}
                  minDate={filterOptions.dueDateRange.from}
                  className="input-primary"
                  placeholderText="To"
                  dateFormat="MMM d, yyyy"
                  isClearable
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="button-primary"
          onClick={onClose}
        >
          Apply Filters
        </motion.button>
      </div>
    </div>
  );
};

export default FilterPanel;