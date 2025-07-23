import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  FaCheck, 
  FaTimes, 
  FaEdit, 
  FaTrash, 
  FaCalendarAlt, 
  FaFlag, 
  FaTag, 
  FaAngleDown, 
  FaAngleUp 
} from 'react-icons/fa';
import { Task, TaskCategory, TaskPriority } from '../types';
import { useTaskStore } from '../store/taskStore';
import TaskForm from './TaskForm';
import clsx from 'clsx';

interface TaskCardProps {
  task: Task;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const PriorityIcon: React.FC<{ priority: TaskPriority }> = ({ priority }) => {
  return (
    <FaFlag className={clsx('mr-1', {
      'text-error-500': priority === 'high',
      'text-warning-500': priority === 'medium',
      'text-success-500': priority === 'low',
    })} />
  );
};

const CategoryBadge: React.FC<{ category: TaskCategory }> = ({ category }) => {
  const categoryClasses = {
    work: 'category-work',
    personal: 'category-personal',
    shopping: 'category-shopping',
    health: 'category-health',
    finance: 'category-finance',
    other: 'bg-gray-100 text-gray-800',
  };
  
  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
  
  return (
    <span className={`category-tag ${categoryClasses[category]}`}>
      {categoryLabel}
    </span>
  );
};

const TaskCard: React.FC<TaskCardProps> = ({ task, index, isExpanded, onToggleExpand }) => {
  const { toggleTaskCompletion, deleteTask } = useTaskStore();
  const [isEditing, setIsEditing] = useState(false);
  
  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTaskCompletion(task.id);
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTask(task.id);
  };
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };
  
  if (isEditing) {
    return (
      <TaskForm 
        task={task} 
        onClose={() => setIsEditing(false)} 
      />
    );
  }
  
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={clsx('task-card', {
            'dragging': snapshot.isDragging,
            'completed': task.completed,
          })}
        >
          <div className="flex items-start justify-between" onClick={onToggleExpand}>
            <div className="flex items-start flex-1 min-w-0">
              <button
                className={clsx(
                  'flex-shrink-0 w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center mr-3 mt-1 transition-colors',
                  task.completed ? 'bg-primary-500 border-primary-500' : 'bg-white hover:bg-gray-100'
                )}
                onClick={handleToggleComplete}
              >
                {task.completed && <FaCheck className="text-white text-xs" />}
              </button>
              
              <div className="flex-1 min-w-0">
                <h3 className={clsx('text-lg font-medium mb-1 truncate', {
                  'completed-task': task.completed
                })}>
                  {task.title}
                </h3>
                
                <div className="flex flex-wrap items-center text-sm text-gray-600 gap-3 mb-2">
                  {task.dueDate && (
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-1 text-primary-400" />
                      <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <PriorityIcon priority={task.priority} />
                    <span className="capitalize">{task.priority}</span>
                  </div>
                  
                  <CategoryBadge category={task.category} />
                </div>
              </div>
            </div>
            
            <div className="flex items-center ml-2">
              <button 
                className="text-gray-400 hover:text-gray-600 p-1"
                onClick={handleEdit}
              >
                <FaEdit />
              </button>
              <button 
                className="text-gray-400 hover:text-error-500 p-1"
                onClick={handleDelete}
              >
                <FaTrash />
              </button>
              <button className="text-gray-400 hover:text-gray-600 p-1 ml-1">
                {isExpanded ? <FaAngleUp /> : <FaAngleDown />}
              </button>
            </div>
          </div>
          
          {isExpanded && task.description && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 pt-3 border-t border-gray-100"
            >
              <p className="text-gray-700 whitespace-pre-line">{task.description}</p>
            </motion.div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;