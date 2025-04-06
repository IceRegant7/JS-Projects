document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const appContainer = document.querySelector('.app-container');
            const categoryList = document.getElementById('category-list');
            const addCategoryBtn = document.getElementById('add-category-btn');
            const addCategoryForm = document.getElementById('add-category-form');
            const newCategoryInput = document.getElementById('new-category-input');
            const saveCategoryBtn = document.getElementById('save-category-btn');
            const taskList = document.getElementById('task-list');
            const addTaskForm = document.getElementById('add-task-form');
            const newTaskInput = document.getElementById('new-task-input');
            const currentCategoryDisplay = document.getElementById('current-category');
            const tasksCountDisplay = document.getElementById('tasks-count');
            const emptyState = document.getElementById('empty-state');
            const filterOptions = document.querySelectorAll('.filter-option');
            const taskModal = document.getElementById('task-modal');
            const closeModalBtn = document.getElementById('close-modal-btn');
            const cancelTaskBtn = document.getElementById('cancel-task-btn');
            const saveTaskBtn = document.getElementById('save-task-btn');
            const deleteTaskBtn = document.getElementById('delete-task-btn');
            const taskTitleInput = document.getElementById('task-title-input');
            const taskDescriptionInput = document.getElementById('task-description-input');
            const taskCategorySelect = document.getElementById('task-category-select');
            const taskDueDateInput = document.getElementById('task-due-date-input');
            const taskImportantCheckbox = document.getElementById('task-important-checkbox');
            const themeToggle = document.getElementById('theme-toggle');
            const helpBtn = document.getElementById('help-btn');
            const sortBtn = document.getElementById('sort-btn');

            // State
            let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            let categories = JSON.parse(localStorage.getItem('categories')) || ['Personal', 'Work', 'Shopping'];
            let currentCategory = 'all';
            let currentFilter = 'all';
            let currentTaskId = null;
            let isEditingTask = false;
            let sortOrder = 'newest';

            // Initialize the app
            function init() {
                renderCategories();
                renderTasks();
                updateTasksCount();
                checkEmptyState();
                setupEventListeners();
                checkDarkModePreference();
            }

            // Set up event listeners
            function setupEventListeners() {
                // Category events
                addCategoryBtn.addEventListener('click', toggleAddCategoryForm);
                saveCategoryBtn.addEventListener('click', saveCategory);
                newCategoryInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') saveCategory();
                });

                // Task events
                addTaskForm.addEventListener('submit', addTask);
                
                // Filter events
                filterOptions.forEach(option => {
                    option.addEventListener('click', function() {
                        setFilter(this.dataset.filter);
                    });
                });

                // Modal events
                closeModalBtn.addEventListener('click', closeTaskModal);
                cancelTaskBtn.addEventListener('click', closeTaskModal);
                saveTaskBtn.addEventListener('click', saveTask);
                deleteTaskBtn.addEventListener('click', deleteTask);

                // Theme toggle
                themeToggle.addEventListener('click', toggleDarkMode);

                // Help button
                helpBtn.addEventListener('click', showHelp);

                // Sort button
                sortBtn.addEventListener('click', toggleSortOrder);
            }

            // Category functions
            function toggleAddCategoryForm() {
                addCategoryForm.style.display = addCategoryForm.style.display === 'none' ? 'flex' : 'none';
                if (addCategoryForm.style.display === 'flex') {
                    newCategoryInput.focus();
                }
            }

            function saveCategory() {
                const categoryName = newCategoryInput.value.trim();
                if (categoryName && !categories.includes(categoryName)) {
                    categories.push(categoryName);
                    saveCategories();
                    renderCategories();
                    newCategoryInput.value = '';
                    toggleAddCategoryForm();
                    // Set the new category as active
                    setCategory(categoryName);
                }
            }

            function saveCategories() {
                localStorage.setItem('categories', JSON.stringify(categories));
            }

            function renderCategories() {
                categoryList.innerHTML = '';
                
                // Add default "All" category
                const allCategoryItem = document.createElement('li');
                allCategoryItem.className = `category-item ${currentCategory === 'all' ? 'active' : ''}`;
                allCategoryItem.innerHTML = `
                    <span>All Tasks</span>
                `;
                allCategoryItem.addEventListener('click', function() {
                    setCategory('all');
                });
                categoryList.appendChild(allCategoryItem);

                // Add user categories
                categories.forEach(category => {
                    const categoryItem = document.createElement('li');
                    categoryItem.className = `category-item ${currentCategory === category ? 'active' : ''}`;
                    categoryItem.innerHTML = `
                        <span>${category}</span>
                        <div class="category-actions">
                            <button class="category-action-btn delete-category-btn" data-category="${category}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                    categoryItem.addEventListener('click', function() {
                        setCategory(category);
                    });

                    // Add delete button event
                    const deleteBtn = categoryItem.querySelector('.delete-category-btn');
                    deleteBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        deleteCategory(category);
                    });

                    categoryList.appendChild(categoryItem);
                });
            }

            function setCategory(category) {
                currentCategory = category;
                currentCategoryDisplay.textContent = category === 'all' ? 'All Tasks' : category;
                renderCategories();
                renderTasks();
                updateTasksCount();
                checkEmptyState();
            }

            function deleteCategory(category) {
                if (confirm(`Delete category "${category}"? Tasks in this category will be moved to "All Tasks".`)) {
                    // Move tasks to "All Tasks"
                    tasks = tasks.map(task => {
                        if (task.category === category) {
                            return {...task, category: ''};
                        }
                        return task;
                    });
                    saveTasks();

                    // Remove category
                    categories = categories.filter(c => c !== category);
                    saveCategories();

                    // Reset to "All Tasks" if viewing deleted category
                    if (currentCategory === category) {
                        setCategory('all');
                    } else {
                        renderCategories();
                    }
                }
            }

            // Task functions
            function addTask(e) {
                e.preventDefault();
                const taskTitle = newTaskInput.value.trim();
                if (taskTitle) {
                    const newTask = {
                        id: Date.now(),
                        title: taskTitle,
                        completed: false,
                        important: false,
                        category: currentCategory === 'all' ? '' : currentCategory,
                        dueDate: '',
                        description: '',
                        createdAt: new Date().toISOString()
                    };
                    tasks.push(newTask);
                    saveTasks();
                    renderTasks();
                    updateTasksCount();
                    newTaskInput.value = '';
                    checkEmptyState();
                }
            }

            function saveTasks() {
                localStorage.setItem('tasks', JSON.stringify(tasks));
            }

            function renderTasks() {
                taskList.innerHTML = '';
                
                let filteredTasks = filterTasks();

                // Sort tasks
                filteredTasks = sortTasks(filteredTasks);

                if (filteredTasks.length === 0) {
                    emptyState.style.display = 'flex';
                    return;
                } else {
                    emptyState.style.display = 'none';
                }

                filteredTasks.forEach(task => {
                    const taskItem = document.createElement('li');
                    taskItem.className = `task-item ${task.completed ? 'completed' : ''} ${task.important ? 'important' : ''}`;
                    taskItem.dataset.id = task.id;
                    
                    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    const isOverdue = dueDate && dueDate < today && !task.completed;
                    
                    taskItem.innerHTML = `
                        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                        <div class="task-content">
                            <div class="task-title">${task.title}</div>
                            <div class="task-meta">
                                ${task.category ? `<span class="task-category">${task.category}</span>` : ''}
                                ${dueDate ? `
                                    <span class="task-due-date ${isOverdue ? 'overdue' : ''}">
                                        <i class="far fa-calendar-alt"></i>
                                        ${dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                ` : ''}
                            </div>
                        </div>
                        <div class="task-actions">
                            <button class="task-action-btn edit-btn" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="task-action-btn important-btn ${task.important ? 'active' : ''}" title="Important">
                                <i class="fas fa-star"></i>
                            </button>
                            <button class="task-action-btn delete-btn" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                    
                    // Add event listeners
                    const checkbox = taskItem.querySelector('.task-checkbox');
                    checkbox.addEventListener('change', function() {
                        toggleTaskComplete(task.id, this.checked);
                    });

                    const editBtn = taskItem.querySelector('.edit-btn');
                    editBtn.addEventListener('click', function() {
                        openTaskModal(task.id);
                    });

                    const importantBtn = taskItem.querySelector('.important-btn');
                    importantBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        toggleTaskImportant(task.id);
                    });

                    const deleteBtn = taskItem.querySelector('.delete-btn');
                    deleteBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        deleteTaskConfirm(task.id);
                    });

                    taskList.appendChild(taskItem);
                });
            }

            function sortTasks(tasks) {
                return [...tasks].sort((a, b) => {
                    if (sortOrder === 'newest') {
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    } else if (sortOrder === 'oldest') {
                        return new Date(a.createdAt) - new Date(b.createdAt);
                    } else if (sortOrder === 'important') {
                        if (a.important === b.important) {
                            return new Date(b.createdAt) - new Date(a.createdAt);
                        }
                        return b.important - a.important;
                    }
                    return 0;
                });
            }

            function toggleSortOrder() {
                const orders = ['newest', 'oldest', 'important'];
                const currentIndex = orders.indexOf(sortOrder);
                sortOrder = orders[(currentIndex + 1) % orders.length];
                
                // Update button icon
                if (sortOrder === 'newest') {
                    sortBtn.innerHTML = '<i class="fas fa-sort-amount-down"></i>';
                } else if (sortOrder === 'oldest') {
                    sortBtn.innerHTML = '<i class="fas fa-sort-amount-up"></i>';
                } else {
                    sortBtn.innerHTML = '<i class="fas fa-star"></i>';
                }
                
                renderTasks();
            }

            function filterTasks() {
                let filteredTasks = [...tasks];

                // Apply category filter
                if (currentCategory !== 'all') {
                    filteredTasks = filteredTasks.filter(task => task.category === currentCategory);
                }

                // Apply additional filters
                switch (currentFilter) {
                    case 'today':
                        const today = new Date().toISOString().split('T')[0];
                        filteredTasks = filteredTasks.filter(task => task.dueDate === today);
                        break;
                    case 'completed':
                        filteredTasks = filteredTasks.filter(task => task.completed);
                        break;
                    case 'important':
                        filteredTasks = filteredTasks.filter(task => task.important);
                        break;
                }

                return filteredTasks;
            }

            function updateTasksCount() {
                const count = filterTasks().length;
                tasksCountDisplay.textContent = count;
            }

            function checkEmptyState() {
                emptyState.style.display = filterTasks().length === 0 ? 'flex' : 'none';
            }

            function toggleTaskComplete(taskId, completed) {
                const taskItem = document.querySelector(`.task-item[data-id="${taskId}"]`);
                if (taskItem) {
                    taskItem.classList.add('completed');
                    
                    // Remove task after animation completes
                    setTimeout(() => {
                        tasks = tasks.filter(task => task.id !== taskId);
                        saveTasks();
                        renderTasks();
                        updateTasksCount();
                        checkEmptyState();
                    }, 350);
                }
            }

            function toggleTaskImportant(taskId) {
                tasks = tasks.map(task => {
                    if (task.id === taskId) {
                        return {...task, important: !task.important};
                    }
                    return task;
                });
                saveTasks();
                renderTasks();
            }

            function deleteTaskConfirm(taskId) {
                if (confirm('Are you sure you want to delete this task?')) {
                    tasks = tasks.filter(task => task.id !== taskId);
                    saveTasks();
                    renderTasks();
                    updateTasksCount();
                    checkEmptyState();
                }
            }

            // Modal functions
            function openTaskModal(taskId = null) {
                if (taskId) {
                    // Editing existing task
                    const task = tasks.find(t => t.id === taskId);
                    if (task) {
                        currentTaskId = taskId;
                        isEditingTask = true;
                        taskTitleInput.value = task.title;
                        taskDescriptionInput.value = task.description || '';
                        taskDueDateInput.value = task.dueDate || '';
                        taskImportantCheckbox.checked = task.important || false;
                        
                        // Populate category select
                        taskCategorySelect.innerHTML = '';
                        const defaultOption = document.createElement('option');
                        defaultOption.value = '';
                        defaultOption.textContent = 'No Category';
                        taskCategorySelect.appendChild(defaultOption);
                        
                        categories.forEach(category => {
                            const option = document.createElement('option');
                            option.value = category;
                            option.textContent = category;
                            if (category === task.category) {
                                option.selected = true;
                            }
                            taskCategorySelect.appendChild(option);
                        });
                        
                        deleteTaskBtn.style.display = 'block';
                    }
                } else {
                    // Adding new task
                    currentTaskId = null;
                    isEditingTask = false;
                    taskTitleInput.value = '';
                    taskDescriptionInput.value = '';
                    taskDueDateInput.value = '';
                    taskImportantCheckbox.checked = false;
                    
                    // Populate category select with current category selected
                    taskCategorySelect.innerHTML = '';
                    const defaultOption = document.createElement('option');
                    defaultOption.value = '';
                    defaultOption.textContent = 'No Category';
                    taskCategorySelect.appendChild(defaultOption);
                    
                    categories.forEach(category => {
                        const option = document.createElement('option');
                        option.value = category;
                        option.textContent = category;
                        if (category === currentCategory && currentCategory !== 'all') {
                            option.selected = true;
                        }
                        taskCategorySelect.appendChild(option);
                    });
                    
                    deleteTaskBtn.style.display = 'none';
                }
                
                taskModal.classList.add('active');
            }

            function closeTaskModal() {
                taskModal.classList.remove('active');
            }

            function saveTask() {
                const title = taskTitleInput.value.trim();
                if (!title) {
                    alert('Task title cannot be empty');
                    return;
                }

                const taskData = {
                    title,
                    description: taskDescriptionInput.value.trim(),
                    category: taskCategorySelect.value || '',
                    dueDate: taskDueDateInput.value || '',
                    important: taskImportantCheckbox.checked,
                    completed: false
                };

                if (isEditingTask) {
                    // Update existing task
                    tasks = tasks.map(task => {
                        if (task.id === currentTaskId) {
                            return {...task, ...taskData};
                        }
                        return task;
                    });
                } else {
                    // Add new task
                    const newTask = {
                        id: Date.now(),
                        ...taskData,
                        createdAt: new Date().toISOString()
                    };
                    tasks.push(newTask);
                }

                saveTasks();
                renderTasks();
                updateTasksCount();
                checkEmptyState();
                closeTaskModal();
            }

            function deleteTask() {
                if (confirm('Are you sure you want to delete this task?')) {
                    tasks = tasks.filter(task => task.id !== currentTaskId);
                    saveTasks();
                    renderTasks();
                    updateTasksCount();
                    checkEmptyState();
                    closeTaskModal();
                }
            }

            // Filter functions
            function setFilter(filter) {
                currentFilter = filter;
                filterOptions.forEach(option => {
                    if (option.dataset.filter === filter) {
                        option.classList.add('active');
                    } else {
                        option.classList.remove('active');
                    }
                });
                renderTasks();
                updateTasksCount();
                checkEmptyState();
            }

            // Theme functions
            function checkDarkModePreference() {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const savedMode = localStorage.getItem('darkMode');
                
                if (savedMode === 'enabled' || (prefersDark && savedMode !== 'disabled')) {
                    document.body.classList.add('dark-mode');
                    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
                }
            }

            function toggleDarkMode() {
                document.body.classList.toggle('dark-mode');
                const isDarkMode = document.body.classList.contains('dark-mode');
                
                if (isDarkMode) {
                    localStorage.setItem('darkMode', 'enabled');
                    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
                } else {
                    localStorage.setItem('darkMode', 'disabled');
                    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
                }
            }

            // Help function
            function showHelp() {
                alert(`Nova Tasks Pro Help:\n\n• Click + to add tasks\n• Check tasks to complete them (they'll disappear)\n• Star important tasks\n• Create categories to organize\n• Use filters to find tasks\n• Sort tasks by newest/oldest/important\n• Dark mode toggle in bottom right`);
            }

            // Initialize the app
            init();
        });