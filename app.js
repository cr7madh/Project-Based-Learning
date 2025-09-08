class TodoApp {
    constructor() {
        this.tasks = [];
        this.categories = [
            {id: 1, name: "Personal", color: "#FF006B", icon: "👤"},
            {id: 2, name: "Work", color: "#00D4FF", icon: "💼"},
            {id: 3, name: "Health", color: "#2CFF05", icon: "🏃"},
            {id: 4, name: "Learning", color: "#FF8F00", icon: "📚"}
        ];
        this.priorities = [
            {id: 1, name: "Low", color: "#64748B", value: 1},
            {id: 2, name: "Medium", color: "#F59E0B", value: 2},
            {id: 3, name: "High", color: "#EF4444", value: 3}
        ];
        this.currentFilter = 'all';
        this.currentCategory = null;
        this.currentView = 'list';
        this.currentSort = 'created';
        this.editingTask = null;
        this.currentMonth = new Date();
        this.searchQuery = '';
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.renderCategories();
        this.renderTasks();
        this.updateStats();
        this.showWelcomeToast();
    }

    loadData() {
        const savedTasks = localStorage.getItem('glass-todo-tasks');
        if (savedTasks) {
            try {
                this.tasks = JSON.parse(savedTasks);
            } catch (e) {
                this.tasks = this.getDefaultTasks();
                this.saveData();
            }
        } else {
            // Load sample tasks on first visit
            this.tasks = this.getDefaultTasks();
            this.saveData();
        }
    }

    getDefaultTasks() {
        return [
            {
                id: 1,
                title: "Welcome to your new Todo App!",
                description: "This is a sample task. Double-click to edit, or use the controls to manage it.",
                completed: false,
                category: 1,
                priority: 2,
                dueDate: null,
                createdAt: new Date().toISOString(),
                notes: "You can add detailed notes to any task for additional context and information."
            },
            {
                id: 2,
                title: "Try the glassmorphism effects",
                description: "Notice the beautiful translucent design and smooth animations",
                completed: false,
                category: 4,
                priority: 1,
                dueDate: this.formatDate(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)),
                createdAt: new Date().toISOString(),
                notes: ""
            }
        ];
    }

    saveData() {
        localStorage.setItem('glass-todo-tasks', JSON.stringify(this.tasks));
    }

    setupEventListeners() {
        // Header controls
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettings();
            });
        }

        const calendarBtn = document.getElementById('calendarBtn');
        if (calendarBtn) {
            calendarBtn.addEventListener('click', () => {
                this.toggleView('calendar');
            });
        }

        // Task input
        const newTaskInput = document.getElementById('newTaskInput');
        if (newTaskInput) {
            newTaskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addTask();
                }
            });
        }

        const addTaskBtn = document.getElementById('addTaskBtn');
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.addTask();
            });
        }

        // FAB
        const fabBtn = document.getElementById('fabBtn');
        if (fabBtn) {
            fabBtn.addEventListener('click', () => {
                if (newTaskInput) {
                    newTaskInput.focus();
                }
            });
        }

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.setFilter(e.target.dataset.filter);
            });
        });

        // View buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleView(e.target.dataset.view);
            });
        });

        // Sort select
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.setSorting(e.target.value);
            });
        }

        // Modal handlers
        this.setupModalHandlers();

        // Calendar navigation
        const prevMonth = document.getElementById('prevMonth');
        const nextMonth = document.getElementById('nextMonth');
        if (prevMonth) {
            prevMonth.addEventListener('click', () => {
                this.navigateMonth(-1);
            });
        }
        if (nextMonth) {
            nextMonth.addEventListener('click', () => {
                this.navigateMonth(1);
            });
        }
    }

    setupModalHandlers() {
        // Task modal
        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.hideModal('taskModal');
            });
        }

        const cancelEdit = document.getElementById('cancelEdit');
        if (cancelEdit) {
            cancelEdit.addEventListener('click', () => {
                this.hideModal('taskModal');
            });
        }

        const saveTask = document.getElementById('saveTask');
        if (saveTask) {
            saveTask.addEventListener('click', () => {
                this.saveTaskChanges();
            });
        }

        // Settings modal
        const closeSettings = document.getElementById('closeSettings');
        if (closeSettings) {
            closeSettings.addEventListener('click', () => {
                this.hideModal('settingsModal');
            });
        }

        const exportData = document.getElementById('exportData');
        if (exportData) {
            exportData.addEventListener('click', () => {
                this.exportData();
            });
        }

        const importData = document.getElementById('importData');
        if (importData) {
            importData.addEventListener('click', () => {
                this.importData();
            });
        }

        const clearData = document.getElementById('clearData');
        if (clearData) {
            clearData.addEventListener('click', () => {
                this.clearAllData();
            });
        }

        // Close modals on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.hideModal(overlay.id);
                }
            });
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + N: New task
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                const newTaskInput = document.getElementById('newTaskInput');
                if (newTaskInput) {
                    newTaskInput.focus();
                }
            }

            // Forward slash: Search
            if (e.key === '/' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    searchInput.focus();
                }
            }

            // Escape: Close modals or clear search
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal-overlay.visible');
                if (activeModal) {
                    this.hideModal(activeModal.id);
                } else {
                    const searchInput = document.getElementById('searchInput');
                    if (searchInput && searchInput.value) {
                        searchInput.value = '';
                        this.handleSearch('');
                    }
                }
            }
        });
    }

    addTask() {
        const input = document.getElementById('newTaskInput');
        if (!input) return;
        
        const title = input.value.trim();
        
        if (!title) {
            this.showToast('Please enter a task title', 'error');
            return;
        }

        const task = {
            id: Date.now() + Math.random(), // Ensure unique ID
            title,
            description: '',
            completed: false,
            category: 1, // Default to Personal
            priority: 2, // Default to Medium
            dueDate: null,
            createdAt: new Date().toISOString(),
            notes: ''
        };

        this.tasks.unshift(task);
        this.saveData();
        input.value = '';
        this.renderTasks();
        this.renderCategories(); // Update category counts
        this.updateStats();
        this.showToast('Task added successfully!', 'success');

        // Animate new task
        setTimeout(() => {
            const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
            if (taskElement) {
                taskElement.style.transform = 'translateY(-10px)';
                taskElement.style.opacity = '0';
                setTimeout(() => {
                    taskElement.style.transition = 'all 0.3s ease';
                    taskElement.style.transform = 'translateY(0)';
                    taskElement.style.opacity = '1';
                }, 50);
            }
        }, 100);
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id == taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveData();
            this.renderTasks();
            this.renderCategories(); // Update category counts
            this.updateStats();
            
            const message = task.completed ? 'Task completed! 🎉' : 'Task marked as active';
            const type = task.completed ? 'success' : 'info';
            this.showToast(message, type);
        }
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id != taskId);
            this.saveData();
            this.renderTasks();
            this.renderCategories(); // Update category counts
            this.updateStats();
            this.showToast('Task deleted', 'info');
        }
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id == taskId);
        if (task) {
            this.editingTask = task;
            this.populateEditModal(task);
            this.showModal('taskModal');
        }
    }

    populateEditModal(task) {
        const editTitle = document.getElementById('editTitle');
        const editDescription = document.getElementById('editDescription');
        const editCategory = document.getElementById('editCategory');
        const editPriority = document.getElementById('editPriority');
        const editDueDate = document.getElementById('editDueDate');
        const editNotes = document.getElementById('editNotes');

        if (editTitle) editTitle.value = task.title;
        if (editDescription) editDescription.value = task.description;
        if (editDueDate) editDueDate.value = task.dueDate || '';
        if (editNotes) editNotes.value = task.notes || '';

        // Populate category and priority options
        this.populateSelectOptions();
        
        if (editCategory) editCategory.value = task.category;
        if (editPriority) editPriority.value = task.priority;
    }

    populateSelectOptions() {
        const categorySelect = document.getElementById('editCategory');
        const prioritySelect = document.getElementById('editPriority');

        if (categorySelect) {
            categorySelect.innerHTML = this.categories.map(cat => 
                `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`
            ).join('');
        }

        if (prioritySelect) {
            prioritySelect.innerHTML = this.priorities.map(pri => 
                `<option value="${pri.id}">${pri.name}</option>`
            ).join('');
        }
    }

    saveTaskChanges() {
        if (!this.editingTask) return;

        const editTitle = document.getElementById('editTitle');
        if (!editTitle) return;

        const title = editTitle.value.trim();
        if (!title) {
            this.showToast('Please enter a task title', 'error');
            return;
        }

        this.editingTask.title = title;
        
        const editDescription = document.getElementById('editDescription');
        const editCategory = document.getElementById('editCategory');
        const editPriority = document.getElementById('editPriority');
        const editDueDate = document.getElementById('editDueDate');
        const editNotes = document.getElementById('editNotes');

        if (editDescription) this.editingTask.description = editDescription.value.trim();
        if (editCategory) this.editingTask.category = parseInt(editCategory.value);
        if (editPriority) this.editingTask.priority = parseInt(editPriority.value);
        if (editDueDate) this.editingTask.dueDate = editDueDate.value || null;
        if (editNotes) this.editingTask.notes = editNotes.value.trim();

        this.saveData();
        this.renderTasks();
        this.renderCategories(); // Update category counts
        this.updateStats();
        this.hideModal('taskModal');
        this.showToast('Task updated successfully!', 'success');
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update filter button states
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        this.renderTasks();
    }

    setCategoryFilter(categoryId) {
        this.currentCategory = this.currentCategory === categoryId ? null : categoryId;
        this.renderTasks();
        this.updateCategoryHighlight();
    }

    setSorting(sortBy) {
        this.currentSort = sortBy;
        this.renderTasks();
    }

    handleSearch(query) {
        this.searchQuery = query.toLowerCase();
        this.renderTasks();
    }

    getFilteredTasks() {
        let filtered = [...this.tasks];

        // Apply text search
        if (this.searchQuery) {
            filtered = filtered.filter(task => 
                task.title.toLowerCase().includes(this.searchQuery) ||
                task.description.toLowerCase().includes(this.searchQuery) ||
                (task.notes && task.notes.toLowerCase().includes(this.searchQuery))
            );
        }

        // Apply status filter
        if (this.currentFilter === 'active') {
            filtered = filtered.filter(task => !task.completed);
        } else if (this.currentFilter === 'completed') {
            filtered = filtered.filter(task => task.completed);
        }

        // Apply category filter
        if (this.currentCategory) {
            filtered = filtered.filter(task => task.category === this.currentCategory);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (this.currentSort) {
                case 'priority':
                    return b.priority - a.priority;
                case 'category':
                    return a.category - b.category;
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'created':
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

        return filtered;
    }

    renderTasks() {
        if (this.currentView === 'calendar') {
            this.renderCalendar();
            return;
        }

        const taskList = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');
        
        if (!taskList || !emptyState) return;
        
        const filtered = this.getFilteredTasks();

        if (filtered.length === 0) {
            taskList.innerHTML = '';
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            taskList.innerHTML = filtered.map(task => this.createTaskHTML(task)).join('');
            this.attachTaskEventListeners();
        }
    }

    createTaskHTML(task) {
        const category = this.categories.find(c => c.id === task.category);
        const priority = this.priorities.find(p => p.id === task.priority);
        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : null;
        
        return `
            <div class="task-item ${task.completed ? 'completed' : ''}" 
                 data-task-id="${task.id}" 
                 style="--category-color: ${category?.color || '#00D4FF'}">
                <div class="task-header-row">
                    <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                         data-action="toggle" data-task-id="${task.id}"></div>
                    <div class="task-content">
                        <div class="task-title">${this.escapeHtml(task.title)}</div>
                        ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
                        <div class="task-meta">
                            <div class="task-category" style="background-color: ${category?.color}20; color: ${category?.color}">
                                <span>${category?.icon || '📋'}</span>
                                <span>${category?.name || 'Personal'}</span>
                            </div>
                            <div class="task-priority">
                                <div class="priority-dot" style="background-color: ${priority?.color}"></div>
                                <span>${priority?.name}</span>
                            </div>
                            ${dueDate ? `<div class="task-due-date">📅 ${dueDate}</div>` : ''}
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="task-action-btn" data-action="edit" data-task-id="${task.id}" title="Edit">✏️</button>
                        <button class="task-action-btn" data-action="delete" data-task-id="${task.id}" title="Delete">🗑️</button>
                    </div>
                </div>
            </div>
        `;
    }

    attachTaskEventListeners() {
        // Remove old event listeners first
        document.querySelectorAll('[data-action]').forEach(element => {
            element.replaceWith(element.cloneNode(true));
        });

        // Add new event listeners
        document.querySelectorAll('[data-action]').forEach(element => {
            element.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = e.target.dataset.action;
                const taskId = parseFloat(e.target.dataset.taskId); // Use parseFloat to handle decimal IDs

                switch (action) {
                    case 'toggle':
                        this.toggleTask(taskId);
                        break;
                    case 'edit':
                        this.editTask(taskId);
                        break;
                    case 'delete':
                        this.deleteTask(taskId);
                        break;
                }
            });
        });

        // Double-click to edit
        document.querySelectorAll('.task-item').forEach(item => {
            item.addEventListener('dblclick', (e) => {
                const taskId = parseFloat(item.dataset.taskId);
                this.editTask(taskId);
            });
        });
    }

    renderCategories() {
        const categoryList = document.getElementById('categoryList');
        if (!categoryList) return;
        
        categoryList.innerHTML = this.categories.map(category => {
            const count = this.tasks.filter(task => task.category === category.id && !task.completed).length;
            return `
                <div class="category-item ${this.currentCategory === category.id ? 'active' : ''}" 
                     data-category-id="${category.id}">
                    <span class="category-icon">${category.icon}</span>
                    <div class="category-info">
                        <div class="category-name">${category.name}</div>
                        <div class="category-count">${count} tasks</div>
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners
        document.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', () => {
                const categoryId = parseInt(item.dataset.categoryId);
                this.setCategoryFilter(categoryId);
            });
        });
    }

    updateCategoryHighlight() {
        document.querySelectorAll('.category-item').forEach(item => {
            const categoryId = parseInt(item.dataset.categoryId);
            item.classList.toggle('active', this.currentCategory === categoryId);
        });
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const active = total - completed;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        const totalEl = document.getElementById('totalTasks');
        const completedEl = document.getElementById('completedTasks');
        const activeEl = document.getElementById('activeCount');
        const rateEl = document.getElementById('completionRate');

        if (totalEl) totalEl.textContent = total;
        if (completedEl) completedEl.textContent = completed;
        if (activeEl) activeEl.textContent = active;
        if (rateEl) rateEl.textContent = completionRate + '%';
    }

    toggleView(view) {
        this.currentView = view;
        
        // Update view buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-view="${view}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Toggle containers
        const taskContainer = document.getElementById('taskContainer');
        const calendarContainer = document.getElementById('calendarContainer');

        if (view === 'calendar') {
            if (taskContainer) taskContainer.classList.add('hidden');
            if (calendarContainer) calendarContainer.classList.remove('hidden');
            this.renderCalendar();
        } else {
            if (taskContainer) taskContainer.classList.remove('hidden');
            if (calendarContainer) calendarContainer.classList.add('hidden');
            this.renderTasks();
        }
    }

    renderCalendar() {
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        
        const currentMonthEl = document.getElementById('currentMonth');
        if (currentMonthEl) {
            currentMonthEl.textContent = 
                this.currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
        }

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const calendarGrid = document.getElementById('calendarGrid');
        if (!calendarGrid) return;
        
        calendarGrid.innerHTML = '';

        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            dayHeader.style.cssText = `
                padding: 0.5rem;
                text-align: center;
                font-weight: 600;
                background: rgba(255, 255, 255, 0.1);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            `;
            calendarGrid.appendChild(dayHeader);
        });

        // Generate calendar days
        const currentDate = new Date(startDate);
        for (let i = 0; i < 42; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = currentDate.getDate();
            
            if (currentDate.getMonth() !== month) {
                dayNumber.style.opacity = '0.3';
            }

            const dayTasks = document.createElement('div');
            dayTasks.className = 'day-tasks';

            // Find tasks for this day
            const dayTasksData = this.tasks.filter(task => {
                if (!task.dueDate) return false;
                const taskDate = new Date(task.dueDate);
                return taskDate.toDateString() === currentDate.toDateString();
            });

            dayTasksData.forEach(task => {
                const taskElement = document.createElement('div');
                taskElement.className = 'calendar-task';
                taskElement.textContent = task.title;
                
                const category = this.categories.find(c => c.id === task.category);
                if (category) {
                    taskElement.style.borderLeftColor = category.color;
                    taskElement.style.backgroundColor = category.color + '20';
                }
                
                dayTasks.appendChild(taskElement);
            });

            dayElement.appendChild(dayNumber);
            dayElement.appendChild(dayTasks);
            calendarGrid.appendChild(dayElement);

            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    navigateMonth(direction) {
        this.currentMonth.setMonth(this.currentMonth.getMonth() + direction);
        this.renderCalendar();
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        modal.classList.add('visible');
        modal.classList.remove('hidden');
        
        // Animate in
        setTimeout(() => {
            const modalContent = modal.querySelector('.modal');
            if (modalContent) {
                modalContent.style.transform = 'scale(1) translateY(0)';
            }
        }, 50);
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        modal.classList.remove('visible');
        
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }

    showSettings() {
        this.renderShortcuts();
        this.showModal('settingsModal');
    }

    renderShortcuts() {
        const shortcuts = [
            { key: 'Ctrl/Cmd + N', action: 'New task' },
            { key: '/', action: 'Search tasks' },
            { key: 'Esc', action: 'Close modal/Clear search' },
            { key: 'Double-click', action: 'Edit task' }
        ];

        const shortcutsList = document.getElementById('shortcutsList');
        if (shortcutsList) {
            shortcutsList.innerHTML = shortcuts.map(shortcut => `
                <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <span style="opacity: 0.8;">${shortcut.action}</span>
                    <kbd style="background: rgba(255,255,255,0.1); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem;">
                        ${shortcut.key}
                    </kbd>
                </div>
            `).join('');
        }
    }

    exportData() {
        const data = {
            tasks: this.tasks,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `glass-todo-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showToast('Data exported successfully!', 'success');
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        if (data.tasks && Array.isArray(data.tasks)) {
                            this.tasks = data.tasks;
                            this.saveData();
                            this.renderTasks();
                            this.renderCategories();
                            this.updateStats();
                            this.hideModal('settingsModal');
                            this.showToast('Data imported successfully!', 'success');
                        } else {
                            throw new Error('Invalid file format');
                        }
                    } catch (error) {
                        this.showToast('Error importing data. Please check the file format.', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    clearAllData() {
        if (confirm('Are you sure you want to delete all tasks? This action cannot be undone.')) {
            this.tasks = [];
            this.saveData();
            this.renderTasks();
            this.renderCategories();
            this.updateStats();
            this.hideModal('settingsModal');
            this.showToast('All data cleared', 'info');
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-color-scheme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-color-scheme', newTheme);
        localStorage.setItem('glass-todo-theme', newTheme);
        
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) {
            themeBtn.textContent = newTheme === 'dark' ? '🌙' : '☀️';
        }
        
        this.showToast(`Switched to ${newTheme} theme`, 'info');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        const container = document.getElementById('toastContainer');
        if (container) {
            container.appendChild(toast);

            // Animate in
            setTimeout(() => toast.classList.add('show'), 100);

            // Remove after delay
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (container.contains(toast)) {
                        container.removeChild(toast);
                    }
                }, 300);
            }, 3000);
        }
    }

    showWelcomeToast() {
        setTimeout(() => {
            this.showToast('Welcome to Glass Todo! ✨ Try adding your first task!', 'success');
        }, 1000);
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Load saved theme
    const savedTheme = localStorage.getItem('glass-todo-theme') || 'dark';
    document.documentElement.setAttribute('data-color-scheme', savedTheme);
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = savedTheme === 'dark' ? '🌙' : '☀️';
    }

    // Initialize app
    window.todoApp = new TodoApp();
});

// Service Worker for offline functionality (basic implementation)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {
        // Service worker registration failed, but app still works
    });
}
