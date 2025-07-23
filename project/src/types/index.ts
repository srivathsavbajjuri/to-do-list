// Task related types
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskCategory = 'work' | 'personal' | 'shopping' | 'health' | 'finance' | 'other';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date | null;
  priority: TaskPriority;
  category: TaskCategory;
}

// Filter and Sort types
export type SortOption = 'dueDate' | 'priority' | 'createdAt' | 'alphabetical';
export type SortDirection = 'asc' | 'desc';

export interface FilterOptions {
  searchTerm: string;
  showCompleted: boolean;
  categories: TaskCategory[];
  priorities: TaskPriority[];
  dueDateRange: {
    from: Date | null;
    to: Date | null;
  };
}

export interface SortOptions {
  sortBy: SortOption;
  direction: SortDirection;
}

// Action history for undo functionality
export interface ActionHistory {
  type: 'add' | 'update' | 'delete' | 'clear' | 'toggleComplete' | 'reorder';
  tasks: Task[];
  timestamp: Date;
}