import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { Task, TaskCategory, TaskPriority } from '../types';
import { useTaskStore } from '../store/taskStore';
import { FaTimes, FaCalendarAlt, FaTag, FaFlag } from 'react-icons/fa';

interface TaskFormProps {
  task?: Task;
  onClose: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onClose }) => {
  const { addTask, updateTask } = useTaskStore();
  
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState<Date | null>(task?.dueDate || null);
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'medium');
  const [category, setCategory] = useState<TaskCategory>(task?.category || 'personal');
  
  const isEditing = !!task;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    if (isEditing && task) {
      updateTask(task.id, {
        title,
        description,
        dueDate,
        priority,
        category,
      });
    } else {
      addTask({
        title,
        description,
        dueDate,
        priority,
        category,
        completed: false,
      });
    }
    
    onClose();
  };
  
  return (
    <div className="bg-white rounded-lg shadow-card p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {isEditing ? 'Edit Task' : 'Add New Task'}
        </h2>
        <button 
          className="text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <FaTimes />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            className="input-primary"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            className="input-primary min-h-[80px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add some details..."
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <FaCalendarAlt className="text-primary-500" /> Due Date
            </label>
            <DatePicker
              selected={dueDate}
              onChange={(date) => setDueDate(date)}
              className="input-primary"
              placeholderText="Select a date"
              dateFormat="MMM d, yyyy"
              minDate={new Date()}
              isClearable
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <FaFlag className="text-primary-500" /> Priority
            </label>
            <select
              className="input-primary"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <FaTag className="text-primary-500" /> Category
            </label>
            <select
              className="input-primary"
              value={category}
              onChange={(e) => setCategory(e.target.value as TaskCategory)}
            >
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="shopping">Shopping</option>
              <option value="health">Health</option>
              <option value="finance">Finance</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <button 
            type="button" 
            className="button-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="button-primary"
          >
            {isEditing ? 'Update Task' : 'Add Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;