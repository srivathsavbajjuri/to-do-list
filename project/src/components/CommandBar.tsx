import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaFilter, FaSort, FaUndo, FaTrash } from 'react-icons/fa';
import TaskForm from './TaskForm';
import FilterPanel from './FilterPanel';
import SortPanel from './SortPanel';
import { useTaskStore } from '../store/taskStore';

interface CommandBarProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const CommandBar: React.FC<CommandBarProps> = ({ isOpen, onOpenChange }) => {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isSortPanelOpen, setIsSortPanelOpen] = useState(false);
  
  const { undo, clearCompleted, clearAll } = useTaskStore();
  
  const toggleTaskForm = () => {
    onOpenChange(!isOpen);
    setIsFilterPanelOpen(false);
    setIsSortPanelOpen(false);
  };
  
  const toggleFilterPanel = () => {
    setIsFilterPanelOpen(!isFilterPanelOpen);
    onOpenChange(false);
    setIsSortPanelOpen(false);
  };
  
  const toggleSortPanel = () => {
    setIsSortPanelOpen(!isSortPanelOpen);
    onOpenChange(false);
    setIsFilterPanelOpen(false);
  };
  
  return (
    <div className="mb-6">
      <motion.div 
        className="bg-white rounded-lg shadow-card p-4 mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-wrap gap-2">
          <button 
            className="button-primary flex items-center gap-2"
            onClick={toggleTaskForm}
          >
            <FaPlus /> Add Task
          </button>
          
          <button 
            className={`${isFilterPanelOpen ? 'bg-primary-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} font-medium py-2 px-4 rounded-md transition-colors flex items-center gap-2`}
            onClick={toggleFilterPanel}
          >
            <FaFilter /> Filter
          </button>
          
          <button 
            className={`${isSortPanelOpen ? 'bg-primary-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} font-medium py-2 px-4 rounded-md transition-colors flex items-center gap-2`}
            onClick={toggleSortPanel}
          >
            <FaSort /> Sort
          </button>
          
          <button 
            className="button-secondary flex items-center gap-2"
            onClick={undo}
          >
            <FaUndo /> Undo
          </button>
          
          <div className="ml-auto flex gap-2">
            <button 
              className="button-secondary flex items-center gap-2"
              onClick={clearCompleted}
            >
              Clear Completed
            </button>
            
            <button 
              className="button-danger flex items-center gap-2"
              onClick={clearAll}
            >
              <FaTrash /> Clear All
            </button>
          </div>
        </div>
      </motion.div>
      
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-4"
        >
          <TaskForm onClose={() => onOpenChange(false)} />
        </motion.div>
      )}
      
      {isFilterPanelOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-4"
        >
          <FilterPanel onClose={() => setIsFilterPanelOpen(false)} />
        </motion.div>
      )}
      
      {isSortPanelOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-4"
        >
          <SortPanel onClose={() => setIsSortPanelOpen(false)} />
        </motion.div>
      )}
    </div>
  );
};

export default CommandBar;