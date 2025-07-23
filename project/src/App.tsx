import React, { useState } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { motion } from 'framer-motion';
import Header from './components/Header';
import TaskList from './components/TaskList';
import Footer from './components/Footer';
import { useTaskStore } from './store/taskStore';
import CommandBar from './components/CommandBar';

const App: React.FC = () => {
  const { tasks, reorderTask } = useTaskStore();
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    reorderTask(sourceIndex, destinationIndex);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="absolute inset-0 z-[-1] gradient-bg"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Header />
      </motion.div>
      
      <main className="flex-grow container mx-auto px-4 py-6 max-w-4xl">
        <DragDropContext onDragEnd={handleDragEnd}>
          <CommandBar isOpen={isTaskFormOpen} onOpenChange={setIsTaskFormOpen} />
          <TaskList tasks={tasks} onAddTask={() => setIsTaskFormOpen(true)} />
        </DragDropContext>
      </main>
      
      <Footer />
    </div>
  );
};

export default App;