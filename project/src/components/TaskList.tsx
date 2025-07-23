import React, { useState } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import TaskCard from './TaskCard';
import { Task } from '../types';
import { useTaskStore } from '../store/taskStore';
import EmptyState from './EmptyState';

interface TaskListProps {
  tasks: Task[];
  onAddTask: () => void;
}

const TaskList: React.FC<TaskListProps> = ({ onAddTask }) => {
  const filteredTasks = useTaskStore(state => state.getFilteredAndSortedTasks());
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  
  const toggleTaskExpand = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };
  
  if (filteredTasks.length === 0) {
    return <EmptyState onAddTask={onAddTask} />;
  }
  
  return (
    <Droppable droppableId="taskList">
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="space-y-3"
        >
          <AnimatePresence>
            {filteredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                layout
              >
                <TaskCard 
                  task={task} 
                  index={index}
                  isExpanded={expandedTaskId === task.id}
                  onToggleExpand={() => toggleTaskExpand(task.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default TaskList;