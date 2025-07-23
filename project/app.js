// Task Store
const TaskStore = {
    tasks: JSON.parse(localStorage.getItem('tasks')) || [],
    filters: {
        searchTerm: '',
        showCompleted: true,
        categories: [],
        priorities: [],
        dueDateRange: { from: null, to: null }
    },
    sort: {
        by: 'createdAt',
        direction: 'desc'
    },
    history: [],

    save() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    },

    addTask(task) {
        const newTask = {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            completed: false,
            ...task
        };
        this.tasks.unshift(newTask);
        this.addToHistory('add', [newTask]);
        this.save();
        return newTask;
    },

    updateTask(id, updates) {
        const index = this.tasks.findIndex(task => task.id === id);
        if (index === -1) return;

        const oldTask = { ...this.tasks[index] };
        const updatedTask = {
            ...this.tasks[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        this.tasks[index] = updatedTask;
        this.addToHistory('update', [oldTask]);
        this.save();
    },

    deleteTask(id) {
        const index = this.tasks.findIndex(task => task.id === id);
        if (index === -1) return;

        const deletedTask = this.tasks[index];
        this.tasks.splice(index, 1);
        this.addToHistory('delete', [deletedTask]);
        this.save();
    },

    toggleTaskCompletion(id) {
        const task = this.tasks.find(task => task.id === id);
        if (!task) return;

        const oldTask = { ...task };
        task.completed = !task.completed;
        task.updatedAt = new Date().toISOString();
        
        this.addToHistory('toggleComplete', [oldTask]);
        this.save();
    },

    reorderTasks(oldIndex, newIndex) {
        const oldOrder = [...this.tasks];
        const [task] = this.tasks.splice(oldIndex, 1);
        this.tasks.splice(newIndex, 0, task);
        
        this.addToHistory('reorder', oldOrder);
        this.save();
    },

    clearCompleted() {
        const completedTasks = this.tasks.filter(task => task.completed);
        if (completedTasks.length === 0) return;

        this.tasks = this.tasks.filter(task => !task.completed);
        this.addToHistory('clear', completedTasks);
        this.save();
    },

    clearAll() {
        if (this.tasks.length === 0) return;

        const oldTasks = [...this.tasks];
        this.tasks = [];
        this.addToHistory('clear', oldTasks);
        this.save();
    },

    addToHistory(type, tasks) {
        this.history.unshift({ type, tasks, timestamp: new Date().toISOString() });
        this.history = this.history.slice(0, 10); // Keep last 10 actions
    },

    undo() {
        if (this.history.length === 0) return false;

        const lastAction = this.history[0];
        this.history.shift();

        switch (lastAction.type) {
            case 'add':
                this.tasks = this.tasks.filter(task => 
                    !lastAction.tasks.some(t => t.id === task.id)
                );
                break;

            case 'update':
            case 'toggleComplete':
                lastAction.tasks.forEach(oldTask => {
                    const index = this.tasks.findIndex(t => t.id === oldTask.id);
                    if (index !== -1) {
                        this.tasks[index] = oldTask;
                    }
                });
                break;

            case 'delete':
                this.tasks = [...lastAction.tasks, ...this.tasks];
                break;

            case 'clear':
                this.tasks = [...lastAction.tasks, ...this.tasks];
                break;

            case 'reorder':
                this.tasks = [...lastAction.tasks];
                break;
        }

        this.save();
        return true;
    },

    getFilteredAndSortedTasks() {
        let filteredTasks = [...this.tasks];

        // Apply filters
        if (!this.filters.showCompleted) {
            filteredTasks = filteredTasks.filter(task => !task.completed);
        }

        if (this.filters.searchTerm) {
            const searchLower = this.filters.searchTerm.toLowerCase();
            filteredTasks = filteredTasks.filter(task => 
                task.title.toLowerCase().includes(searchLower) || 
                (task.description && task.description.toLowerCase().includes(searchLower))
            );
        }

        if (this.filters.categories.length > 0) {
            filteredTasks = filteredTasks.filter(task => 
                this.filters.categories.includes(task.category)
            );
        }

        if (this.filters.priorities.length > 0) {
            filteredTasks = filteredTasks.filter(task => 
                this.filters.priorities.includes(task.priority)
            );
        }

        if (this.filters.dueDateRange.from || this.filters.dueDateRange.to) {
            filteredTasks = filteredTasks.filter(task => {
                if (!task.dueDate) return false;

                const taskDate = new Date(task.dueDate);
                const fromDate = this.filters.dueDateRange.from ? new Date(this.filters.dueDateRange.from) : null;
                const toDate = this.filters.dueDateRange.to ? new Date(this.filters.dueDateRange.to) : null;

                if (fromDate && toDate) {
                    return taskDate >= fromDate && taskDate <= toDate;
                } else if (fromDate) {
                    return taskDate >= fromDate;
                } else if (toDate) {
                    return taskDate <= toDate;
                }

                return true;
            });
        }

        // Apply sorting
        const { by, direction } = this.sort;
        
        filteredTasks.sort((a, b) => {
            const multiplier = direction === 'asc' ? 1 : -1;

            switch (by) {
                case 'dueDate':
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return multiplier;
                    if (!b.dueDate) return -multiplier;
                    return multiplier * (new Date(a.dueDate) - new Date(b.dueDate));

                case 'priority': {
                    const priorityValues = { high: 3, medium: 2, low: 1 };
                    return multiplier * (priorityValues[b.priority] - priorityValues[a.priority]);
                }

                case 'alphabetical':
                    return multiplier * a.title.localeCompare(b.title);

                case 'createdAt':
                default:
                    return multiplier * (new Date(b.createdAt) - new Date(a.createdAt));
            }
        });

        return filteredTasks;
    }
};

// UI Controller
const UI = {
    elements: {
        taskList: document.getElementById('taskList'),
        emptyState: document.getElementById('emptyState'),
        taskForm: document.getElementById('taskForm'),
        taskFormContainer: document.getElementById('taskFormContainer'),
        filterPanel: document.getElementById('filterPanel'),
        sortPanel: document.getElementById('sortPanel'),
        searchInput: document.getElementById('searchInput'),
        showCompleted: document.getElementById('showCompleted'),
        categoryFilters: document.getElementById('categoryFilters'),
        priorityFilters: document.getElementById('priorityFilters'),
        sortOptions: document.querySelectorAll('.sort-option'),
        sortDirectionBtn: document.getElementById('toggleSortDirection')
    },

    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.renderTasks();
        this.setupFilterTags();
    },

    setupEventListeners() {
        // Command bar buttons
        document.getElementById('addTaskBtn').addEventListener('click', () => this.showTaskForm());
        document.getElementById('filterBtn').addEventListener('click', () => this.togglePanel('filterPanel'));
        document.getElementById('sortBtn').addEventListener('click', () => this.togglePanel('sortPanel'));
        document.getElementById('undoBtn').addEventListener('click', () => this.handleUndo());
        document.getElementById('clearCompletedBtn').addEventListener('click', () => this.handleClearCompleted());
        document.getElementById('clearAllBtn').addEventListener('click', () => this.handleClearAll());

        // Task form
        this.elements.taskForm.addEventListener('submit', (e) => this.handleTaskSubmit(e));
        document.getElementById('closeTaskForm').addEventListener('click', () => this.hideTaskForm());
        document.getElementById('cancelTaskBtn').addEventListener('click', () => this.hideTaskForm());

        // Filter panel
        document.getElementById('closeFilterPanel').addEventListener('click', () => this.hidePanel('filterPanel'));
        document.getElementById('resetFilters').addEventListener('click', () => this.resetFilters());
        this.elements.searchInput.addEventListener('input', (e) => this.handleSearchInput(e));
        this.elements.showCompleted.addEventListener('change', (e) => this.handleShowCompletedChange(e));

        // Sort panel
        document.getElementById('closeSortPanel').addEventListener('click', () => this.hidePanel('sortPanel'));
        this.elements.sortOptions.forEach(option => {
            option.addEventListener('click', () => this.handleSortOptionClick(option));
        });
        this.elements.sortDirectionBtn.addEventListener('click', () => this.toggleSortDirection());

        // Empty state
        document.getElementById('emptyStateAddBtn').addEventListener('click', () => this.showTaskForm());
    },

    setupDragAndDrop() {
        new Sortable(this.elements.taskList, {
            animation: 150,
            ghostClass: 'dragging',
            onEnd: (evt) => {
                TaskStore.reorderTasks(evt.oldIndex, evt.newIndex);
                this.renderTasks();
            }
        });
    },

    setupFilterTags() {
        // Setup category filters
        const categories = ['work', 'personal', 'shopping', 'health', 'finance', 'other'];
        this.elements.categoryFilters.innerHTML = categories.map(category => `
            <button class="tag category-${category}" data-category="${category}">
                ${category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
        `).join('');

        this.elements.categoryFilters.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag')) {
                const category = e.target.dataset.category;
                e.target.classList.toggle('selected');
                
                const selectedCategories = Array.from(this.elements.categoryFilters.querySelectorAll('.selected'))
                    .map(el => el.dataset.category);
                
                TaskStore.filters.categories = selectedCategories;
                this.renderTasks();
            }
        });

        // Setup priority filters
        const priorities = ['low', 'medium', 'high'];
        this.elements.priorityFilters.innerHTML = priorities.map(priority => `
            <button class="tag priority-${priority}" data-priority="${priority}">
                ${priority.charAt(0).toUpperCase() + priority.slice(1)}
            </button>
        `).join('');

        this.elements.priorityFilters.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag')) {
                const priority = e.target.dataset.priority;
                e.target.classList.toggle('selected');
                
                const selectedPriorities = Array.from(this.elements.priorityFilters.querySelectorAll('.selected'))
                    .map(el => el.dataset.priority);
                
                TaskStore.filters.priorities = selectedPriorities;
                this.renderTasks();
            }
        });
    },

    renderTasks() {
        const tasks = TaskStore.getFilteredAndSortedTasks();

        if (tasks.length === 0) {
            this.elements.taskList.innerHTML = '';
            this.elements.emptyState.classList.remove('hidden');
            return;
        }

        this.elements.emptyState.classList.add('hidden');
        this.elements.taskList.innerHTML = tasks.map(task => this.createTaskCard(task)).join('');

        // Setup task card event listeners
        tasks.forEach(task => {
            const card = document.getElementById(`task-${task.id}`);
            if (!card) return;

            // Checkbox
            card.querySelector('.task-checkbox').addEventListener('click', () => {
                TaskStore.toggleTaskCompletion(task.id);
                this.renderTasks();
            });

            // Delete button
            card.querySelector('.delete-task').addEventListener('click', () => {
                TaskStore.deleteTask(task.id);
                this.renderTasks();
            });

            // Edit button
            card.querySelector('.edit-task').addEventListener('click', () => {
                this.showTaskForm(task);
            });

            // Expand/collapse
            card.querySelector('.toggle-description').addEventListener('click', () => {
                card.querySelector('.task-description').classList.toggle('hidden');
            });
        });
    },

    createTaskCard(task) {
        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : null;
        const description = task.description ? `
            <div class="task-description hidden">
                ${task.description}
            </div>
        ` : '';

        return `
            <div id="task-${task.id}" class="task-card ${task.completed ? 'task-completed' : ''}" data-id="${task.id}">
                <div class="task-header">
                    <div class="task-checkbox ${task.completed ? 'checked' : ''}" role="checkbox" aria-checked="${task.completed}"></div>
                    <div class="task-content">
                        <h3 class="task-title">${task.title}</h3>
                        <div class="task-meta">
                            ${dueDate ? `
                                <span class="task-meta-item">
                                    <i class="fas fa-calendar-alt"></i>
                                    ${dueDate}
                                </span>
                            ` : ''}
                            <span class="task-meta-item priority-${task.priority}">
                                <i class="fas fa-flag"></i>
                                ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                            <span class="tag category-${task.category}">
                                ${task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                            </span>
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="btn-icon edit-task">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete-task">
                            <i class="fas fa-trash"></i>
                        </button>
                        ${task.description ? `
                            <button class="btn-icon toggle-description">
                                <i class="fas fa-angle-down"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
                ${description}
            </div>
        `;
    },

    showTaskForm(task = null) {
        const form = this.elements.taskForm;
        const titleInput = document.getElementById('taskTitle');
        const descriptionInput = document.getElementById('taskDescription');
        const dueDateInput = document.getElementById('taskDueDate');
        const prioritySelect = document.getElementById('taskPriority');
        const categorySelect = document.getElementById('taskCategory');

        if (task) {
            titleInput.value = task.title;
            descriptionInput.value = task.description || '';
            dueDateInput.value = task.dueDate ? task.dueDate.split('T')[0] : '';
            prioritySelect.value = task.priority;
            categorySelect.value = task.category;
            form.dataset.taskId = task.id;
        } else {
            form.reset();
            delete form.dataset.taskId;
        }

        this.elements.taskFormContainer.classList.remove('hidden');
    },

    hideTaskForm() {
        this.elements.taskFormContainer.classList.add('hidden');
        this.elements.taskForm.reset();
    },

    togglePanel(panelId) {
        const panel = this.elements[panelId];
        const isHidden = panel.classList.contains('hidden');

        // Hide all panels first
        ['filterPanel', 'sortPanel'].forEach(id => {
            if (id !== panelId) {
                this.elements[id].classList.add('hidden');
            }
        });

        // Toggle the selected panel
        panel.classList.toggle('hidden');

        // Update button states
        document.getElementById('filterBtn').classList.toggle('bg-primary-600', panelId === 'filterPanel' && !isHidden);
        document.getElementById('sortBtn').classList.toggle('bg-primary-600', panelId === 'sortPanel' && !isHidden);
    },

    hidePanel(panelId) {
        this.elements[panelId].classList.add('hidden');
        if (panelId === 'filterPanel') {
            document.getElementById('filterBtn').classList.remove('bg-primary-600');
        } else if (panelId === 'sortPanel') {
            document.getElementById('sortBtn').classList.remove('bg-primary-600');
        }
    },

    handleTaskSubmit(e) {
        e.preventDefault();

        const formData = {
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            dueDate: document.getElementById('taskDueDate').value || null,
            priority: document.getElementById('taskPriority').value,
            category: document.getElementById('taskCategory').value
        };

        const taskId = this.elements.taskForm.dataset.taskId;

        if (taskId) {
            TaskStore.updateTask(taskId, formData);
        } else {
            TaskStore.addTask(formData);
        }

        this.hideTaskForm();
        this.renderTasks();
    },

    handleSearchInput(e) {
        TaskStore.filters.searchTerm = e.target.value;
        this.renderTasks();
    },

    handleShowCompletedChange(e) {
        TaskStore.filters.showCompleted = e.target.checked;
        this.renderTasks();
    },

    handleSortOptionClick(option) {
        const sortBy = option.dataset.sort;
        
        this.elements.sortOptions.forEach(opt => {
            opt.classList.toggle('active', opt === option);
        });

        TaskStore.sort.by = sortBy;
        this.renderTasks();
    },

    toggleSortDirection() {
        const btn = this.elements.sortDirectionBtn;
        const icon = btn.querySelector('i');
        const text = btn.querySelector('span');

        TaskStore.sort.direction = TaskStore.sort.direction === 'asc' ? 'desc' : 'asc';
        
        icon.classList.toggle('fa-sort-amount-down', TaskStore.sort.direction === 'desc');
        icon.classList.toggle('fa-sort-amount-up', TaskStore.sort.direction === 'asc');
        
        text.textContent = TaskStore.sort.direction === 'asc' 
            ? 'Ascending (A → Z, Oldest → Newest)'
            : 'Descending (Z → A, Newest → Oldest)';

        this.renderTasks();
    },

    handleUndo() {
        if (TaskStore.undo()) {
            this.renderTasks();
        }
    },

    handleClearCompleted() {
        if (confirm('Are you sure you want to clear all completed tasks?')) {
            TaskStore.clearCompleted();
            this.renderTasks();
        }
    },

    handleClearAll() {
        if (confirm('Are you sure you want to clear all tasks? This cannot be undone!')) {
            TaskStore.clearAll();
            this.renderTasks();
        }
    },

    resetFilters() {
        TaskStore.filters = {
            searchTerm: '',
            showCompleted: true,
            categories: [],
            priorities: [],
            dueDateRange: { from: null, to: null }
        };

        // Reset UI
        this.elements.searchInput.value = '';
        this.elements.showCompleted.checked = true;
        this.elements.categoryFilters.querySelectorAll('.tag').forEach(tag => {
            tag.classList.remove('selected');
        });
        this.elements.priorityFilters.querySelectorAll('.tag').forEach(tag => {
            tag.classList.remove('selected');
        });

        this.renderTasks();
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    UI.init();
});