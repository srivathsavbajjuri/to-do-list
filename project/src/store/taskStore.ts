import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { 
  Task, 
  TaskCategory, 
  TaskPriority, 
  FilterOptions,
  SortOptions,
  ActionHistory,
  SortOption,
  SortDirection
} from '../types';
import { toast } from 'react-toastify';
import { compareAsc, compareDesc, isWithinInterval, startOfDay } from 'date-fns';

interface TaskState {
  tasks: Task[];
  filterOptions: FilterOptions;
  sortOptions: SortOptions;
  actionHistory: ActionHistory[];
  
  // Task CRUD operations
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updatedTask: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  reorderTask: (sourceIndex: number, destinationIndex: number) => void;
  
  // Bulk actions
  clearCompleted: () => void;
  clearAll: () => void;
  
  // Filtering and sorting
  setFilterOptions: (options: Partial<FilterOptions>) => void;
  setSortOptions: (options: Partial<SortOptions>) => void;
  resetFilters: () => void;
  
  // Undo functionality
  undo: () => void;
  
  // Get filtered and sorted tasks
  getFilteredAndSortedTasks: () => Task[];
}

const initialFilterOptions: FilterOptions = {
  searchTerm: '',
  showCompleted: true,
  categories: [],
  priorities: [],
  dueDateRange: {
    from: null,
    to: null
  }
};

const initialSortOptions: SortOptions = {
  sortBy: 'createdAt',
  direction: 'desc'
};

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      filterOptions: initialFilterOptions,
      sortOptions: initialSortOptions,
      actionHistory: [],
      
      addTask: (taskData) => {
        const newTask: Task = {
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date(),
          completed: false,
          ...taskData
        };
        
        set((state) => {
          const newHistory: ActionHistory = {
            type: 'add',
            tasks: [newTask],
            timestamp: new Date()
          };
          
          return {
            tasks: [newTask, ...state.tasks],
            actionHistory: [newHistory, ...state.actionHistory].slice(0, 10) // Keep last 10 actions
          };
        });
        
        toast.success('Task added successfully!');
      },
      
      updateTask: (id, updatedTaskData) => {
        set((state) => {
          const taskIndex = state.tasks.findIndex(task => task.id === id);
          if (taskIndex === -1) return state;
          
          const oldTask = state.tasks[taskIndex];
          const updatedTask = {
            ...oldTask,
            ...updatedTaskData,
            updatedAt: new Date()
          };
          
          const newTasks = [...state.tasks];
          newTasks[taskIndex] = updatedTask;
          
          const newHistory: ActionHistory = {
            type: 'update',
            tasks: [oldTask], // Store the old version for undo
            timestamp: new Date()
          };
          
          return {
            tasks: newTasks,
            actionHistory: [newHistory, ...state.actionHistory].slice(0, 10)
          };
        });
        
        toast.info('Task updated!');
      },
      
      deleteTask: (id) => {
        set((state) => {
          const taskIndex = state.tasks.findIndex(task => task.id === id);
          if (taskIndex === -1) return state;
          
          const deletedTask = state.tasks[taskIndex];
          const newTasks = state.tasks.filter(task => task.id !== id);
          
          const newHistory: ActionHistory = {
            type: 'delete',
            tasks: [deletedTask], // Store the deleted task for undo
            timestamp: new Date()
          };
          
          return {
            tasks: newTasks,
            actionHistory: [newHistory, ...state.actionHistory].slice(0, 10)
          };
        });
        
        toast.error('Task deleted!');
      },
      
      toggleTaskCompletion: (id) => {
        set((state) => {
          const taskIndex = state.tasks.findIndex(task => task.id === id);
          if (taskIndex === -1) return state;
          
          const oldTask = state.tasks[taskIndex];
          const updatedTask = {
            ...oldTask,
            completed: !oldTask.completed,
            updatedAt: new Date()
          };
          
          const newTasks = [...state.tasks];
          newTasks[taskIndex] = updatedTask;
          
          const newHistory: ActionHistory = {
            type: 'toggleComplete',
            tasks: [oldTask], // Store the old version for undo
            timestamp: new Date()
          };
          
          return {
            tasks: newTasks,
            actionHistory: [newHistory, ...state.actionHistory].slice(0, 10)
          };
        });
      },
      
      reorderTask: (sourceIndex, destinationIndex) => {
        set((state) => {
          const filteredTasks = get().getFilteredAndSortedTasks();
          const actualSourceIndex = state.tasks.findIndex(t => t.id === filteredTasks[sourceIndex].id);
          const actualDestinationIndex = state.tasks.findIndex(t => t.id === filteredTasks[destinationIndex].id);
          
          const newTasks = [...state.tasks];
          const [removed] = newTasks.splice(actualSourceIndex, 1);
          newTasks.splice(actualDestinationIndex, 0, removed);
          
          const newHistory: ActionHistory = {
            type: 'reorder',
            tasks: [...state.tasks], // Store the old order for undo
            timestamp: new Date()
          };
          
          return {
            tasks: newTasks,
            actionHistory: [newHistory, ...state.actionHistory].slice(0, 10)
          };
        });
      },
      
      clearCompleted: () => {
        set((state) => {
          const completedTasks = state.tasks.filter(task => task.completed);
          if (completedTasks.length === 0) return state;
          
          const newTasks = state.tasks.filter(task => !task.completed);
          
          const newHistory: ActionHistory = {
            type: 'clear',
            tasks: completedTasks, // Store cleared tasks for undo
            timestamp: new Date()
          };
          
          return {
            tasks: newTasks,
            actionHistory: [newHistory, ...state.actionHistory].slice(0, 10)
          };
        });
        
        toast.info('Completed tasks cleared!');
      },
      
      clearAll: () => {
        set((state) => {
          if (state.tasks.length === 0) return state;
          
          const newHistory: ActionHistory = {
            type: 'clear',
            tasks: [...state.tasks], // Store all tasks for undo
            timestamp: new Date()
          };
          
          return {
            tasks: [],
            actionHistory: [newHistory, ...state.actionHistory].slice(0, 10)
          };
        });
        
        toast.info('All tasks cleared!');
      },
      
      setFilterOptions: (options) => {
        set((state) => ({
          filterOptions: {
            ...state.filterOptions,
            ...options
          }
        }));
      },
      
      setSortOptions: (options) => {
        set((state) => ({
          sortOptions: {
            ...state.sortOptions,
            ...options
          }
        }));
      },
      
      resetFilters: () => {
        set({
          filterOptions: initialFilterOptions,
          sortOptions: initialSortOptions
        });
        
        toast.info('Filters reset!');
      },
      
      undo: () => {
        const { actionHistory } = get();
        if (actionHistory.length === 0) {
          toast.info('Nothing to undo!');
          return;
        }
        
        const lastAction = actionHistory[0];
        
        set((state) => {
          let newTasks = [...state.tasks];
          
          switch (lastAction.type) {
            case 'add':
              // Remove the added task
              newTasks = newTasks.filter(task => 
                !lastAction.tasks.some(t => t.id === task.id)
              );
              break;
            
            case 'update':
            case 'toggleComplete':
              // Restore the previous version of the task
              lastAction.tasks.forEach(oldTask => {
                const index = newTasks.findIndex(t => t.id === oldTask.id);
                if (index !== -1) {
                  newTasks[index] = oldTask;
                }
              });
              break;
            
            case 'delete':
              // Restore the deleted task
              newTasks = [...lastAction.tasks, ...newTasks];
              break;
            
            case 'clear':
              // Restore the cleared tasks
              newTasks = [...lastAction.tasks, ...newTasks];
              break;
            
            case 'reorder':
              // Restore the previous order
              newTasks = [...lastAction.tasks];
              break;
            
            default:
              break;
          }
          
          return {
            tasks: newTasks,
            actionHistory: state.actionHistory.slice(1) // Remove the undone action
          };
        });
        
        toast.success('Action undone!');
      },
      
      getFilteredAndSortedTasks: () => {
        const { tasks, filterOptions, sortOptions } = get();
        
        // Apply filters
        let filteredTasks = [...tasks];
        
        // Filter by completion status
        if (!filterOptions.showCompleted) {
          filteredTasks = filteredTasks.filter(task => !task.completed);
        }
        
        // Filter by search term
        if (filterOptions.searchTerm) {
          const searchLower = filterOptions.searchTerm.toLowerCase();
          filteredTasks = filteredTasks.filter(task => 
            task.title.toLowerCase().includes(searchLower) || 
            (task.description && task.description.toLowerCase().includes(searchLower))
          );
        }
        
        // Filter by categories
        if (filterOptions.categories.length > 0) {
          filteredTasks = filteredTasks.filter(task => 
            filterOptions.categories.includes(task.category)
          );
        }
        
        // Filter by priorities
        if (filterOptions.priorities.length > 0) {
          filteredTasks = filteredTasks.filter(task => 
            filterOptions.priorities.includes(task.priority)
          );
        }
        
        // Filter by due date range
        if (filterOptions.dueDateRange.from || filterOptions.dueDateRange.to) {
          filteredTasks = filteredTasks.filter(task => {
            if (!task.dueDate) return false;
            
            const taskDueDate = startOfDay(new Date(task.dueDate));
            
            if (filterOptions.dueDateRange.from && filterOptions.dueDateRange.to) {
              return isWithinInterval(taskDueDate, {
                start: startOfDay(filterOptions.dueDateRange.from),
                end: startOfDay(filterOptions.dueDateRange.to)
              });
            } else if (filterOptions.dueDateRange.from) {
              return compareAsc(taskDueDate, startOfDay(filterOptions.dueDateRange.from)) >= 0;
            } else if (filterOptions.dueDateRange.to) {
              return compareAsc(taskDueDate, startOfDay(filterOptions.dueDateRange.to)) <= 0;
            }
            
            return true;
          });
        }
        
        // Apply sorting
        const { sortBy, direction } = sortOptions;
        
        filteredTasks.sort((a, b) => {
          const compareFunction = direction === 'asc' ? compareAsc : compareDesc;
          
          switch (sortBy) {
            case 'dueDate':
              if (!a.dueDate && !b.dueDate) return 0;
              if (!a.dueDate) return direction === 'asc' ? 1 : -1;
              if (!b.dueDate) return direction === 'asc' ? -1 : 1;
              return compareFunction(new Date(a.dueDate), new Date(b.dueDate));
            
            case 'priority': {
              const priorityValues = { high: 3, medium: 2, low: 1 };
              const priorityA = priorityValues[a.priority];
              const priorityB = priorityValues[b.priority];
              return direction === 'asc' 
                ? priorityA - priorityB 
                : priorityB - priorityA;
            }
            
            case 'alphabetical':
              return direction === 'asc' 
                ? a.title.localeCompare(b.title) 
                : b.title.localeCompare(a.title);
            
            case 'createdAt':
            default:
              return compareFunction(new Date(a.createdAt), new Date(b.createdAt));
          }
        });
        
        return filteredTasks;
      }
    }),
    {
      name: 'task-storage',
      partialize: (state) => ({ 
        tasks: state.tasks,
        // Don't persist filter/sort options or action history
      })
    }
  )
);