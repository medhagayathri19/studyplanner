/**
 * ==========================================================================
 * STUDYMATE – STUDENT STUDY PLANNER
 * Complete Vanilla JavaScript Application Logic
 * 
 * College Mini Project Architecture:
 * - State Management & LocalStorage Persistence
 * - Task Management (CRUD, Search & Multi-Filters)
 * - Interactive Monthly Calendar View
 * - Pomodoro Focus Timer with Web Audio Alerts & Circular SVG Progress
 * - Study Session Logger & Daily Goal Tracker
 * - Pure HTML/CSS Statistics & Analytics Visualizations
 * - Toast Notification System & Theme Toggler
 * ==========================================================================
 */

// Global Application State
let appState = {
  tasks: [],
  sessions: [],
  goals: {
    dailyGoalHours: 3.0
  },
  streak: {
    count: 0,
    lastStudyDate: null
  },
  pomodoroSettings: {
    work: 25,
    shortBreak: 5,
    longBreak: 15
  },
  theme: 'light'
};

// Pomodoro Timer Runtime State
let timerState = {
  mode: 'work', // 'work', 'shortBreak', 'longBreak'
  timeRemaining: 25 * 60, // in seconds
  totalTime: 25 * 60,
  isRunning: false,
  intervalId: null
};

// Calendar Runtime State
let calendarState = {
  currentDate: new Date(),
  selectedDateStr: null
};

// Motivational Quotes Database
const MOTIVATIONAL_QUOTES = [
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" }
];

/* --------------------------------------------------------------------------
   1. INITIALIZATION & LOCALSTORAGE MANAGEMENT
   -------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  // Load data from LocalStorage or initialize defaults
  loadAppState();

  // Initialize Modules & Views
  initTheme();
  initNavigation();
  initTaskForm();
  initFiltersAndSearch();
  initPomodoroTimer();
  initTrackerForm();
  initCalendar();
  
  // Render All Views
  renderAllViews();
  displayRandomQuote();
  updateGreetingDate();
});

/**
 * Loads application state from browser's localStorage.
 * Seeds initial sample data if first time opening the app.
 */
function loadAppState() {
  const savedData = localStorage.getItem('studymate_data');
  if (savedData) {
    try {
      appState = JSON.parse(savedData);
    } catch (e) {
      console.error('Failed to parse saved data, initializing default state.', e);
      seedSampleData();
    }
  } else {
    seedSampleData();
  }
}

/**
 * Saves current appState to localStorage.
 */
function saveAppState() {
  try {
    localStorage.setItem('studymate_data', JSON.stringify(appState));
  } catch (e) {
    showToast('LocalStorage save error! Memory might be full.', 'danger');
  }
}

/**
 * Seeds sample initial data so the user sees a realistic demonstration immediately.
 */
function seedSampleData() {
  const today = new Date();
  const dateTodayStr = formatDateYYYYMMDD(today);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateTomorrowStr = formatDateYYYYMMDD(tomorrow);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dateYesterdayStr = formatDateYYYYMMDD(yesterday);

  appState = {
    tasks: [
      {
        id: 'task-1',
        title: 'DBMS Assignment 2',
        subject: 'Database Management Systems',
        category: 'Assignment',
        description: 'Complete SQL queries and ER diagram normalization exercises.',
        date: dateTomorrowStr,
        startTime: '14:00',
        deadline: `${dateTomorrowStr}T23:59`,
        priority: 'High',
        duration: 90,
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'task-2',
        title: 'Read Operating Systems Ch 4',
        subject: 'Operating Systems',
        category: 'Reading',
        description: 'Process Synchronization & Semaphores concept study.',
        date: dateTodayStr,
        startTime: '10:00',
        deadline: `${dateTodayStr}T18:00`,
        priority: 'Medium',
        duration: 60,
        completed: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'task-3',
        title: 'Computer Networks Quiz Revision',
        subject: 'Computer Networks',
        category: 'Exam Prep',
        description: 'Review OSI layers, TCP/UDP headers, and subnetting problems.',
        date: dateTodayStr,
        startTime: '16:00',
        deadline: `${dateTodayStr}T20:00`,
        priority: 'High',
        duration: 120,
        completed: false,
        createdAt: new Date().toISOString()
      }
    ],
    sessions: [
      {
        id: 'sess-1',
        subject: 'Operating Systems',
        date: dateYesterdayStr,
        duration: 90,
        notes: 'Reviewed Process scheduling algorithms.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'sess-2',
        subject: 'Database Management Systems',
        date: dateTodayStr,
        duration: 60,
        notes: 'SQL Inner & Outer Joins practice.',
        createdAt: new Date().toISOString()
      }
    ],
    goals: {
      dailyGoalHours: 3.0
    },
    streak: {
      count: 2,
      lastStudyDate: dateYesterdayStr
    },
    pomodoroSettings: {
      work: 25,
      shortBreak: 5,
      longBreak: 15
    },
    theme: 'light'
  };

  saveAppState();
}

/**
 * Resets all project data back to empty / defaults.
 */
function resetProjectData() {
  if (confirm('Are you sure you want to reset all StudyMate data? This will clear tasks and logs.')) {
    localStorage.removeItem('studymate_data');
    seedSampleData();
    renderAllViews();
    showToast('Project data reset to default demo state.', 'info');
  }
}

/* --------------------------------------------------------------------------
   2. THEME & NAVIGATION CONTROLS
   -------------------------------------------------------------------------- */

function initTheme() {
  const savedTheme = appState.theme || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  const themeBtnDesktop = document.getElementById('theme-toggle-desktop');
  const themeBtnMobile = document.getElementById('theme-toggle-mobile');

  const toggleHandler = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    appState.theme = newTheme;
    saveAppState();
    showToast(`Switched to ${newTheme} mode`, 'info');
  };

  if (themeBtnDesktop) themeBtnDesktop.addEventListener('click', toggleHandler);
  if (themeBtnMobile) themeBtnMobile.addEventListener('click', toggleHandler);
}

function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link, [data-section]');
  const sections = document.querySelectorAll('.content-section');
  const sidebar = document.getElementById('sidebar');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const resetBtn = document.getElementById('reset-data-btn');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetSectionId = link.getAttribute('data-section');
      if (!targetSectionId) return;

      // Update Active Nav Button
      document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active'));
      const activeNav = document.querySelector(`.nav-link[data-section="${targetSectionId}"]`);
      if (activeNav) activeNav.classList.add('active');

      // Update Section Visibility
      sections.forEach(sec => sec.classList.remove('active'));
      const targetSection = document.getElementById(`section-${targetSectionId}`);
      if (targetSection) targetSection.classList.add('active');

      // Close mobile menu if open
      if (sidebar) sidebar.classList.remove('mobile-open');
      if (sidebarOverlay) sidebarOverlay.classList.remove('mobile-open');
      
      // Re-render context-specific modules
      if (targetSectionId === 'calendar') renderCalendar();
      if (targetSectionId === 'analytics') renderAnalytics();
    });
  });

  // Mobile Drawer Toggle
  if (mobileMenuBtn && sidebar && sidebarOverlay) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
      sidebarOverlay.classList.toggle('mobile-open');
    });

    sidebarOverlay.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      sidebarOverlay.classList.remove('mobile-open');
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', resetProjectData);
  }
}

/* --------------------------------------------------------------------------
   3. TASK MANAGEMENT MODULE (ADD, EDIT, DELETE, FILTER)
   -------------------------------------------------------------------------- */

function initTaskForm() {
  const quickAddBtn = document.getElementById('quick-add-task-btn');
  const addMainBtn = document.getElementById('add-task-main-btn');
  const taskModal = document.getElementById('task-modal');
  const closeModalBtn = document.getElementById('close-task-modal-btn');
  const clearFormBtn = document.getElementById('clear-task-form-btn');
  const taskForm = document.getElementById('task-form');

  const openTaskModal = (taskToEdit = null) => {
    taskForm.reset();
    document.getElementById('task-id').value = '';
    
    // Set default date to today
    document.getElementById('task-date').value = formatDateYYYYMMDD(new Date());

    if (taskToEdit) {
      document.getElementById('task-modal-title').textContent = 'Edit Study Task';
      document.getElementById('task-id').value = taskToEdit.id;
      document.getElementById('task-title').value = taskToEdit.title;
      document.getElementById('task-subject').value = taskToEdit.subject;
      document.getElementById('task-category').value = taskToEdit.category;
      document.getElementById('task-desc').value = taskToEdit.description || '';
      document.getElementById('task-date').value = taskToEdit.date;
      document.getElementById('task-start-time').value = taskToEdit.startTime || '';
      document.getElementById('task-deadline').value = taskToEdit.deadline;
      document.getElementById('task-priority').value = taskToEdit.priority;
      document.getElementById('task-duration').value = taskToEdit.duration || 60;
    } else {
      document.getElementById('task-modal-title').textContent = 'Create Study Task';
    }

    taskModal.classList.add('active');
  };

  const closeTaskModal = () => {
    taskModal.classList.remove('active');
  };

  if (quickAddBtn) quickAddBtn.addEventListener('click', () => openTaskModal());
  if (addMainBtn) addMainBtn.addEventListener('click', () => openTaskModal());
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeTaskModal);
  if (clearFormBtn) clearFormBtn.addEventListener('click', () => taskForm.reset());

  // Form Submit Handler (Add / Edit)
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const taskId = document.getElementById('task-id').value;
    const title = document.getElementById('task-title').value.trim();
    const subject = document.getElementById('task-subject').value.trim();
    const category = document.getElementById('task-category').value;
    const description = document.getElementById('task-desc').value.trim();
    const date = document.getElementById('task-date').value;
    const startTime = document.getElementById('task-start-time').value;
    const deadline = document.getElementById('task-deadline').value;
    const priority = document.getElementById('task-priority').value;
    const duration = parseInt(document.getElementById('task-duration').value) || 30;

    // Validation
    if (!title || !subject || !date || !deadline) {
      showToast('Please fill in all required fields marked with *', 'warning');
      return;
    }

    if (taskId) {
      // Edit Existing Task
      const index = appState.tasks.findIndex(t => t.id === taskId);
      if (index !== -1) {
        appState.tasks[index] = {
          ...appState.tasks[index],
          title, subject, category, description, date, startTime, deadline, priority, duration
        };
        showToast('Task updated successfully!', 'success');
      }
    } else {
      // Create New Task
      const newTask = {
        id: 'task-' + Date.now(),
        title,
        subject,
        category,
        description,
        date,
        startTime,
        deadline,
        priority,
        duration,
        completed: false,
        createdAt: new Date().toISOString()
      };
      appState.tasks.push(newTask);
      showToast('New study task added!', 'success');
    }

    saveAppState();
    closeTaskModal();
    renderAllViews();
  });

  // Global handle for task editing
  window.editTask = (id) => {
    const task = appState.tasks.find(t => t.id === id);
    if (task) openTaskModal(task);
  };
}

function initFiltersAndSearch() {
  const searchInput = document.getElementById('search-task-input');
  const filterSubject = document.getElementById('filter-subject');
  const filterPriority = document.getElementById('filter-priority');
  const filterStatus = document.getElementById('filter-status');
  const filterDate = document.getElementById('filter-date');
  const clearFiltersBtn = document.getElementById('clear-filters-btn');

  const triggerFilter = () => renderTasks();

  if (searchInput) searchInput.addEventListener('input', triggerFilter);
  if (filterSubject) filterSubject.addEventListener('change', triggerFilter);
  if (filterPriority) filterPriority.addEventListener('change', triggerFilter);
  if (filterStatus) filterStatus.addEventListener('change', triggerFilter);
  if (filterDate) filterDate.addEventListener('change', triggerFilter);

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      searchInput.value = '';
      filterSubject.value = 'all';
      filterPriority.value = 'all';
      filterStatus.value = 'all';
      filterDate.value = '';
      renderTasks();
    });
  }
}

/**
 * Populate Subject Filter Dropdown dynamically with all unique subjects from user tasks.
 */
function updateSubjectDropdown() {
  const filterSubject = document.getElementById('filter-subject');
  if (!filterSubject) return;

  const currentVal = filterSubject.value;
  const subjects = [...new Set(appState.tasks.map(t => t.subject).filter(Boolean))];

  filterSubject.innerHTML = '<option value="all">All Subjects</option>';
  subjects.forEach(subj => {
    const opt = document.createElement('option');
    opt.value = subj;
    opt.textContent = subj;
    filterSubject.appendChild(opt);
  });

  filterSubject.value = currentVal;
}

/**
 * Renders the main task list cards based on active search & filters.
 */
function renderTasks() {
  const container = document.getElementById('tasks-container');
  if (!container) return;

  updateSubjectDropdown();

  const searchVal = (document.getElementById('search-task-input')?.value || '').toLowerCase();
  const subjectVal = document.getElementById('filter-subject')?.value || 'all';
  const priorityVal = document.getElementById('filter-priority')?.value || 'all';
  const statusVal = document.getElementById('filter-status')?.value || 'all';
  const dateVal = document.getElementById('filter-date')?.value || '';

  const now = new Date();

  // Filter Tasks Array
  const filtered = appState.tasks.filter(task => {
    // Search Keyword
    const matchesSearch = task.title.toLowerCase().includes(searchVal) ||
                          task.subject.toLowerCase().includes(searchVal) ||
                          (task.description || '').toLowerCase().includes(searchVal);

    // Subject Filter
    const matchesSubject = subjectVal === 'all' || task.subject === subjectVal;

    // Priority Filter
    const matchesPriority = priorityVal === 'all' || task.priority === priorityVal;

    // Status Filter
    const isOverdue = !task.completed && new Date(task.deadline) < now;
    let matchesStatus = true;
    if (statusVal === 'pending') matchesStatus = !task.completed && !isOverdue;
    if (statusVal === 'completed') matchesStatus = task.completed;
    if (statusVal === 'overdue') matchesStatus = isOverdue;

    // Date Filter
    const matchesDate = !dateVal || task.date === dateVal;

    return matchesSearch && matchesSubject && matchesPriority && matchesStatus && matchesDate;
  });

  // Empty State Check
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📚</div>
        <h4>No Study Tasks Found</h4>
        <p>There are no tasks matching your selected filters. Create a new task to get started!</p>
        <button class="btn btn-primary btn-sm" onclick="document.getElementById('add-task-main-btn').click()">+ Add Study Task</button>
      </div>
    `;
    return;
  }

  // Render Cards
  container.innerHTML = filtered.map(task => {
    const isOverdue = !task.completed && new Date(task.deadline) < now;
    const priorityClass = `badge-${task.priority.toLowerCase()}`;
    
    let statusBadgeHTML = `<span class="badge badge-pending">Pending</span>`;
    if (task.completed) {
      statusBadgeHTML = `<span class="badge badge-completed">Completed</span>`;
    } else if (isOverdue) {
      statusBadgeHTML = `<span class="badge badge-overdue">Overdue</span>`;
    }

    const formattedDeadline = formatDateTimeFriendly(task.deadline);

    return `
      <div class="task-card ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue-border' : ''}">
        <div class="task-card-header">
          <div class="task-title-group">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTaskStatus('${task.id}')">
            <div>
              <h4 class="task-title">${escapeHTML(task.title)}</h4>
              <span class="task-subject-tag">${escapeHTML(task.subject)}</span>
            </div>
          </div>
          <div style="display: flex; gap: 0.3rem; align-items: center;">
            <span class="badge ${priorityClass}">${task.priority}</span>
            ${statusBadgeHTML}
          </div>
        </div>

        ${task.description ? `<p class="task-desc">${escapeHTML(task.description)}</p>` : ''}

        <div class="task-meta-list">
          <div class="meta-item">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>Date: ${task.date} ${task.startTime ? 'at ' + task.startTime : ''}</span>
          </div>
          <div class="meta-item">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>Deadline: ${formattedDeadline}</span>
          </div>
          <div class="meta-item">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <span>Est. Duration: ${task.duration} mins</span>
          </div>
        </div>

        <div class="task-actions">
          <button class="btn btn-secondary btn-sm" onclick="editTask('${task.id}')">Edit</button>
          <button class="btn btn-outline btn-sm text-danger" onclick="deleteTask('${task.id}')">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

window.toggleTaskStatus = (id) => {
  const task = appState.tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveAppState();
    renderAllViews();
    showToast(task.completed ? 'Task marked as completed! 🎉' : 'Task marked as pending.', 'success');
  }
};

window.deleteTask = (id) => {
  if (confirm('Are you sure you want to delete this study task?')) {
    appState.tasks = appState.tasks.filter(t => t.id !== id);
    saveAppState();
    renderAllViews();
    showToast('Task deleted.', 'info');
  }
};

/* --------------------------------------------------------------------------
   4. DASHBOARD & DEADLINE REMINDERS
   -------------------------------------------------------------------------- */

function updateDashboard() {
  const now = new Date();
  const todayStr = formatDateYYYYMMDD(now);

  const totalTasks = appState.tasks.length;
  const completedTasks = appState.tasks.filter(t => t.completed).length;
  const pendingTasks = appState.tasks.filter(t => !t.completed && new Date(t.deadline) >= now).length;
  const overdueTasks = appState.tasks.filter(t => !t.completed && new Date(t.deadline) < now).length;
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Update Stat Cards
  document.getElementById('stat-total-tasks').textContent = totalTasks;
  document.getElementById('stat-completed-tasks').textContent = completedTasks;
  document.getElementById('stat-completion-pct').textContent = `${completionPct}% Completion rate`;
  document.getElementById('stat-pending-tasks').textContent = pendingTasks;
  document.getElementById('stat-overdue-tasks').textContent = overdueTasks;

  // Calculate Today's Studied Hours
  const todaySessions = appState.sessions.filter(s => s.date === todayStr);
  const todayMins = todaySessions.reduce((acc, curr) => acc + curr.duration, 0);
  const todayHours = (todayMins / 60).toFixed(1);
  const goalHours = appState.goals.dailyGoalHours.toFixed(1);
  const goalPct = Math.min(100, Math.round((todayHours / goalHours) * 100));

  document.getElementById('dash-studied-hours').textContent = `${todayHours} hrs`;
  document.getElementById('dash-target-hours').textContent = `${goalHours} hrs`;
  document.getElementById('dash-goal-progress-bar').style.width = `${goalPct}%`;

  // Streak Update & Check
  calculateStreak();
  document.getElementById('dash-streak-count').textContent = appState.streak.count;
  document.getElementById('stat-streak-display').textContent = `${appState.streak.count} Days`;

  // Render Upcoming Priority Tasks on Dashboard
  renderDashboardUpcomingTasks();

  // Render Deadline Alerts
  renderDeadlineAlerts();
}

function calculateStreak() {
  const todayStr = formatDateYYYYMMDD(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDateYYYYMMDD(yesterday);

  const todayMins = appState.sessions.filter(s => s.date === todayStr).reduce((a, b) => a + b.duration, 0);
  const targetMins = appState.goals.dailyGoalHours * 60;

  if (todayMins >= targetMins) {
    if (appState.streak.lastStudyDate !== todayStr) {
      if (appState.streak.lastStudyDate === yesterdayStr) {
        appState.streak.count += 1;
      } else if (appState.streak.count === 0) {
        appState.streak.count = 1;
      }
      appState.streak.lastStudyDate = todayStr;
      saveAppState();
    }
  }
}

function renderDashboardUpcomingTasks() {
  const container = document.getElementById('dashboard-upcoming-tasks');
  if (!container) return;

  const upcoming = appState.tasks
    .filter(t => !t.completed)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 3);

  if (upcoming.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 1rem 0;">
        ✨ All caught up! No pending priority tasks.
      </div>
    `;
    return;
  }

  container.innerHTML = upcoming.map(task => `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 0.8rem; background: var(--bg-hover); border-radius: var(--radius-md);">
      <div style="display: flex; align-items: center; gap: 0.6rem;">
        <input type="checkbox" class="task-checkbox" onchange="toggleTaskStatus('${task.id}')">
        <div>
          <strong style="font-size: 0.9rem;">${escapeHTML(task.title)}</strong>
          <span style="font-size: 0.75rem; color: var(--primary-color); margin-left: 0.5rem;">[${escapeHTML(task.subject)}]</span>
        </div>
      </div>
      <span class="badge badge-${task.priority.toLowerCase()}">${task.priority}</span>
    </div>
  `).join('');
}

function renderDeadlineAlerts() {
  const container = document.getElementById('deadline-alerts-container');
  if (!container) return;

  const now = new Date();
  const alerts = [];

  appState.tasks.forEach(task => {
    if (task.completed) return;

    const deadlineDate = new Date(task.deadline);
    const diffHours = (deadlineDate - now) / (1000 * 60 * 60);

    if (diffHours < 0) {
      alerts.push({
        type: 'danger',
        message: `⚠️ Overdue Task: "${task.title}" was due on ${formatDateTimeFriendly(task.deadline)}`
      });
    } else if (diffHours <= 24) {
      alerts.push({
        type: 'warning',
        message: `⏰ Due Soon: "${task.title}" is due in ${Math.ceil(diffHours)} hours!`
      });
    }
  });

  container.innerHTML = alerts.slice(0, 2).map(alert => `
    <div class="alert-banner ${alert.type}">
      <span>${alert.message}</span>
      <button class="btn-text" onclick="this.parentElement.remove()">Dismiss</button>
    </div>
  `).join('');
}

/* --------------------------------------------------------------------------
   5. CALENDAR & SCHEDULE MODULE
   -------------------------------------------------------------------------- */

function initCalendar() {
  const prevBtn = document.getElementById('cal-prev-btn');
  const nextBtn = document.getElementById('cal-next-btn');
  const todayBtn = document.getElementById('cal-today-btn');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      calendarState.currentDate.setMonth(calendarState.currentDate.getMonth() - 1);
      renderCalendar();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      calendarState.currentDate.setMonth(calendarState.currentDate.getMonth() + 1);
      renderCalendar();
    });
  }

  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      calendarState.currentDate = new Date();
      calendarState.selectedDateStr = formatDateYYYYMMDD(new Date());
      renderCalendar();
    });
  }

  calendarState.selectedDateStr = formatDateYYYYMMDD(new Date());
}

function renderCalendar() {
  const monthYearLabel = document.getElementById('calendar-month-year');
  const daysContainer = document.getElementById('calendar-days-container');
  if (!daysContainer) return;

  const year = calendarState.currentDate.getFullYear();
  const month = calendarState.currentDate.getMonth();

  const monthNames = ["January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"];
  
  if (monthYearLabel) monthYearLabel.textContent = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const todayStr = formatDateYYYYMMDD(new Date());
  daysContainer.innerHTML = '';

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    const dayNum = prevMonthTotalDays - i;
    const dayDiv = document.createElement('div');
    dayDiv.className = 'cal-day other-month';
    dayDiv.innerHTML = `<span>${dayNum}</span>`;
    daysContainer.appendChild(dayDiv);
  }

  // Current month days
  for (let d = 1; d <= totalDays; d++) {
    const dateObj = new Date(year, month, d);
    const dateStr = formatDateYYYYMMDD(dateObj);

    const dayDiv = document.createElement('div');
    dayDiv.className = 'cal-day';
    if (dateStr === todayStr) dayDiv.classList.add('today');
    if (dateStr === calendarState.selectedDateStr) dayDiv.classList.add('selected');

    // Check tasks on this date
    const tasksOnDate = appState.tasks.filter(t => t.date === dateStr);
    const hasHighPriority = tasksOnDate.some(t => t.priority === 'High' && !t.completed);

    let dotsHTML = '';
    if (tasksOnDate.length > 0) {
      dotsHTML = `<div class="task-dot-container">
        <span class="task-dot ${hasHighPriority ? 'has-high' : ''}"></span>
      </div>`;
    }

    dayDiv.innerHTML = `<span>${d}</span>${dotsHTML}`;

    dayDiv.addEventListener('click', () => {
      calendarState.selectedDateStr = dateStr;
      renderCalendar();
    });

    daysContainer.appendChild(dayDiv);
  }

  renderAgendaForSelectedDate();
}

function renderAgendaForSelectedDate() {
  const titleEl = document.getElementById('agenda-date-title');
  const container = document.getElementById('agenda-tasks-list');
  if (!container) return;

  const dateStr = calendarState.selectedDateStr || formatDateYYYYMMDD(new Date());
  if (titleEl) titleEl.textContent = dateStr;

  const tasksOnDate = appState.tasks.filter(t => t.date === dateStr);

  if (tasksOnDate.length === 0) {
    container.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 1.5rem 0;">No tasks scheduled for ${dateStr}.</p>`;
    return;
  }

  container.innerHTML = tasksOnDate.map(task => `
    <div style="padding: 0.75rem; background: var(--bg-hover); border-radius: var(--radius-md); border-left: 3px solid ${task.completed ? 'var(--success-color)' : 'var(--primary-color)'};">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <strong style="font-size: 0.9rem; ${task.completed ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${escapeHTML(task.title)}</strong>
        <span class="badge badge-${task.priority.toLowerCase()}">${task.priority}</span>
      </div>
      <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.3rem;">
        Subject: ${escapeHTML(task.subject)} | Est: ${task.duration} mins
      </div>
    </div>
  `).join('');
}

/* --------------------------------------------------------------------------
   6. POMODORO TIMER MODULE
   -------------------------------------------------------------------------- */

function initPomodoroTimer() {
  const startBtn = document.getElementById('pomo-start-btn');
  const pauseBtn = document.getElementById('pomo-pause-btn');
  const resetBtn = document.getElementById('pomo-reset-btn');
  const settingsBtn = document.getElementById('pomodoro-settings-btn');
  const settingsModal = document.getElementById('pomo-modal');
  const closeSettingsBtn = document.getElementById('close-pomo-modal-btn');
  const settingsForm = document.getElementById('pomo-settings-form');
  const modeTabs = document.querySelectorAll('.pomo-tab');

  // Mode Switch Tabs
  modeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      modeTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const mode = tab.getAttribute('data-mode');
      setPomodoroMode(mode);
    });
  });

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      if (!timerState.isRunning) {
        timerState.isRunning = true;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        timerState.intervalId = setInterval(tickTimer, 1000);
      }
    });
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      if (timerState.isRunning) {
        timerState.isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        clearInterval(timerState.intervalId);
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      pauseTimer();
      setPomodoroMode(timerState.mode);
    });
  }

  // Timer Settings Modal
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      document.getElementById('setting-work').value = appState.pomodoroSettings.work;
      document.getElementById('setting-short').value = appState.pomodoroSettings.shortBreak;
      document.getElementById('setting-long').value = appState.pomodoroSettings.longBreak;
      settingsModal.classList.add('active');
    });
  }

  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', () => settingsModal.classList.remove('active'));
  }

  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      appState.pomodoroSettings.work = parseInt(document.getElementById('setting-work').value) || 25;
      appState.pomodoroSettings.shortBreak = parseInt(document.getElementById('setting-short').value) || 5;
      appState.pomodoroSettings.longBreak = parseInt(document.getElementById('setting-long').value) || 15;
      saveAppState();
      settingsModal.classList.remove('active');
      setPomodoroMode(timerState.mode);
      showToast('Pomodoro durations updated!', 'success');
    });
  }

  setPomodoroMode('work');
}

function pauseTimer() {
  timerState.isRunning = false;
  clearInterval(timerState.intervalId);
  const startBtn = document.getElementById('pomo-start-btn');
  const pauseBtn = document.getElementById('pomo-pause-btn');
  if (startBtn) startBtn.disabled = false;
  if (pauseBtn) pauseBtn.disabled = true;
}

function setPomodoroMode(mode) {
  pauseTimer();
  timerState.mode = mode;

  let durationMins = appState.pomodoroSettings.work;
  let labelText = "Time to Focus!";

  if (mode === 'shortBreak') {
    durationMins = appState.pomodoroSettings.shortBreak;
    labelText = "Short Rest Break ☕";
  } else if (mode === 'longBreak') {
    durationMins = appState.pomodoroSettings.longBreak;
    labelText = "Long Relaxation Break 🎉";
  }

  timerState.totalTime = durationMins * 60;
  timerState.timeRemaining = timerState.totalTime;

  document.getElementById('pomo-mode-label').textContent = labelText;
  updateTimerUI();
}

function tickTimer() {
  if (timerState.timeRemaining > 0) {
    timerState.timeRemaining -= 1;
    updateTimerUI();
  } else {
    // Timer Finished
    pauseTimer();
    playTimerAlertSound();
    
    if (timerState.mode === 'work') {
      showToast('🔔 Pomodoro Focus Session Completed! Take a well-deserved break.', 'success');
      
      // Auto Log Session if checked
      const autoLog = document.getElementById('auto-log-pomo')?.checked;
      if (autoLog) {
        logPomodoroSession(appState.pomodoroSettings.work);
      }
    } else {
      showToast('☕ Break Time Finished! Ready to start studying again?', 'info');
    }
  }
}

function updateTimerUI() {
  const display = document.getElementById('pomo-time-display');
  const ringProgress = document.getElementById('pomo-ring-progress');

  const mins = Math.floor(timerState.timeRemaining / 60);
  const secs = timerState.timeRemaining % 60;
  const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  if (display) display.textContent = timeStr;

  // SVG Ring Progress Calculation (Circumference ~ 596.9 for r=95)
  if (ringProgress) {
    const circumference = 596.9;
    const fraction = timerState.timeRemaining / timerState.totalTime;
    const offset = circumference * (1 - fraction);
    ringProgress.style.strokeDashoffset = offset;
  }
}

/**
 * Audio Synthesizer Beep using Web Audio API (Zero external audio file required!)
 */
function playTimerAlertSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 tone
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.2);
  } catch (e) {
    console.log('Audio API not supported or user gesture required.');
  }
}

function logPomodoroSession(minutes) {
  const newSession = {
    id: 'sess-' + Date.now(),
    subject: 'Pomodoro Study Focus',
    date: formatDateYYYYMMDD(new Date()),
    duration: minutes,
    notes: 'Completed via Pomodoro Timer',
    createdAt: new Date().toISOString()
  };

  appState.sessions.push(newSession);
  saveAppState();
  renderAllViews();
}

/* --------------------------------------------------------------------------
   7. STUDY TRACKER & GOAL MODULE
   -------------------------------------------------------------------------- */

function initTrackerForm() {
  const form = document.getElementById('log-session-form');
  const saveGoalBtn = document.getElementById('save-goal-btn');
  const goalInput = document.getElementById('input-daily-goal');

  // Set default date input to today
  const dateInput = document.getElementById('session-date');
  if (dateInput) dateInput.value = formatDateYYYYMMDD(new Date());

  if (goalInput) goalInput.value = appState.goals.dailyGoalHours;

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const subject = document.getElementById('session-subject').value.trim();
      const date = document.getElementById('session-date').value;
      const duration = parseInt(document.getElementById('session-duration').value);
      const notes = document.getElementById('session-notes').value.trim();

      if (!subject || !date || !duration) {
        showToast('Please fill in required session details.', 'warning');
        return;
      }

      const newSession = {
        id: 'sess-' + Date.now(),
        subject,
        date,
        duration,
        notes,
        createdAt: new Date().toISOString()
      };

      appState.sessions.push(newSession);
      saveAppState();
      form.reset();
      document.getElementById('session-date').value = formatDateYYYYMMDD(new Date());
      renderAllViews();
      showToast('Study session logged!', 'success');
    });
  }

  if (saveGoalBtn && goalInput) {
    saveGoalBtn.addEventListener('click', () => {
      const newGoal = parseFloat(goalInput.value);
      if (newGoal && newGoal > 0) {
        appState.goals.dailyGoalHours = newGoal;
        saveAppState();
        renderAllViews();
        showToast(`Daily study goal updated to ${newGoal} hours!`, 'success');
      }
    });
  }

  // Edit Goal Button on Dashboard
  const editGoalBtn = document.getElementById('edit-goal-btn');
  if (editGoalBtn) {
    editGoalBtn.addEventListener('click', () => {
      const navBtn = document.querySelector('.nav-link[data-section="tracker"]');
      if (navBtn) navBtn.click();
    });
  }
}

function renderStudyTracker() {
  const tableBody = document.getElementById('sessions-table-body');
  const todayTotalEl = document.getElementById('tracker-today-total');
  const weekTotalEl = document.getElementById('tracker-week-total');
  const goalBarEl = document.getElementById('tracker-goal-bar');
  const goalPctEl = document.getElementById('tracker-goal-pct');

  const todayStr = formatDateYYYYMMDD(new Date());

  // Calculate Today's Total
  const todaySessions = appState.sessions.filter(s => s.date === todayStr);
  const todayMins = todaySessions.reduce((acc, s) => acc + s.duration, 0);
  if (todayTotalEl) todayTotalEl.textContent = `${todayMins} mins`;

  // Calculate This Week's Total
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekSessions = appState.sessions.filter(s => new Date(s.date) >= weekAgo);
  const weekMins = weekSessions.reduce((acc, s) => acc + s.duration, 0);
  if (weekTotalEl) weekTotalEl.textContent = `${(weekMins / 60).toFixed(1)} hrs`;

  // Goal Bar Progress
  const goalHours = appState.goals.dailyGoalHours;
  const todayHours = todayMins / 60;
  const goalPct = Math.min(100, Math.round((todayHours / goalHours) * 100));

  if (goalBarEl) goalBarEl.style.width = `${goalPct}%`;
  if (goalPctEl) goalPctEl.textContent = `${goalPct}%`;

  // Render Table
  if (!tableBody) return;

  if (appState.sessions.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No study sessions logged yet.</td></tr>`;
    return;
  }

  // Sort descending by date
  const sortedSessions = [...appState.sessions].sort((a, b) => new Date(b.date) - new Date(a.date));

  tableBody.innerHTML = sortedSessions.map(sess => `
    <tr>
      <td>${sess.date}</td>
      <td><strong>${escapeHTML(sess.subject)}</strong></td>
      <td>${sess.duration} mins</td>
      <td>${escapeHTML(sess.notes || '-')}</td>
      <td><button class="btn btn-outline btn-sm text-danger" onclick="deleteStudySession('${sess.id}')">Delete</button></td>
    </tr>
  `).join('');
}

window.deleteStudySession = (id) => {
  if (confirm('Delete this logged study session?')) {
    appState.sessions = appState.sessions.filter(s => s.id !== id);
    saveAppState();
    renderAllViews();
    showToast('Session removed.', 'info');
  }
};

/* --------------------------------------------------------------------------
   8. STATISTICS & ANALYTICS MODULE (BAR & SUBJECT CHARTS)
   -------------------------------------------------------------------------- */

function renderAnalytics() {
  renderWeeklyChart();
  renderSubjectBreakdown();
  renderProductivityHighlights();
}

function renderWeeklyChart() {
  const chartContainer = document.getElementById('weekly-bar-chart');
  if (!chartContainer) return;

  const days = [];
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = formatDateYYYYMMDD(d);
    const dayName = dayLabels[d.getDay()];

    const mins = appState.sessions
      .filter(s => s.date === dateStr)
      .reduce((acc, curr) => acc + curr.duration, 0);

    const hours = (mins / 60).toFixed(1);
    days.push({ dayName, hours: parseFloat(hours) });
  }

  const maxHours = Math.max(...days.map(d => d.hours), appState.goals.dailyGoalHours, 1);

  chartContainer.innerHTML = days.map(d => {
    const fillPct = Math.round((d.hours / maxHours) * 100);
    return `
      <div class="bar-column">
        <div class="bar-fill" style="height: ${fillPct}%" data-tooltip="${d.hours} hrs"></div>
        <span class="bar-label">${d.dayName}</span>
      </div>
    `;
  }).join('');
}

function renderSubjectBreakdown() {
  const container = document.getElementById('subject-distribution-list');
  if (!container) return;

  const subjectTotals = {};
  let totalMins = 0;

  appState.sessions.forEach(s => {
    subjectTotals[s.subject] = (subjectTotals[s.subject] || 0) + s.duration;
    totalMins += s.duration;
  });

  if (totalMins === 0) {
    container.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 1.5rem 0;">Log study sessions to view subject time distribution.</p>`;
    return;
  }

  const subjectsSorted = Object.keys(subjectTotals).sort((a, b) => subjectTotals[b] - subjectTotals[a]);

  container.innerHTML = subjectsSorted.map(subj => {
    const mins = subjectTotals[subj];
    const hours = (mins / 60).toFixed(1);
    const pct = Math.round((mins / totalMins) * 100);

    return `
      <div class="subject-stat-item">
        <div class="subject-info">
          <span>${escapeHTML(subj)}</span>
          <span>${hours} hrs (${pct}%)</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderProductivityHighlights() {
  const topSubjEl = document.getElementById('stat-top-subject');
  const prodRateEl = document.getElementById('stat-productivity-rate');

  // Most Studied Subject
  const subjectTotals = {};
  appState.sessions.forEach(s => {
    subjectTotals[s.subject] = (subjectTotals[s.subject] || 0) + s.duration;
  });

  let topSubject = 'None yet';
  let maxMins = 0;
  for (const subj in subjectTotals) {
    if (subjectTotals[subj] > maxMins) {
      maxMins = subjectTotals[subj];
      topSubject = subj;
    }
  }

  if (topSubjEl) topSubjEl.textContent = topSubject;

  // Task Completion Productivity Rate
  const totalTasks = appState.tasks.length;
  const completedTasks = appState.tasks.filter(t => t.completed).length;
  const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (prodRateEl) prodRateEl.textContent = `${pct}%`;
}

/* --------------------------------------------------------------------------
   9. TOAST NOTIFICATIONS & UTILITY FUNCTIONS
   -------------------------------------------------------------------------- */

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: '✅',
    danger: '⚠️',
    warning: '⏰',
    info: '💡'
  };

  toast.innerHTML = `
    <span class="toast-icon">${iconMap[type] || '💡'}</span>
    <span class="toast-message">${escapeHTML(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

function renderAllViews() {
  updateDashboard();
  renderTasks();
  renderCalendar();
  renderStudyTracker();
  renderAnalytics();
}

function displayRandomQuote() {
  const quoteText = document.getElementById('quote-text');
  const quoteAuthor = document.getElementById('quote-author');
  if (quoteText && quoteAuthor) {
    const random = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    quoteText.textContent = `"${random.text}"`;
    quoteAuthor.textContent = `– ${random.author}`;
  }
}

function updateGreetingDate() {
  const dateEl = document.getElementById('today-date-text');
  if (dateEl) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = new Date().toLocaleDateString(undefined, options);
  }
}

// Format Date Object to YYYY-MM-DD
function formatDateYYYYMMDD(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Format ISO/datetime-local string to user-friendly format
function formatDateTimeFriendly(dtStr) {
  if (!dtStr) return 'N/A';
  try {
    const d = new Date(dtStr);
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return dtStr;
  }
}

// Prevent XSS attacks when rendering user inputs into innerHTML
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
