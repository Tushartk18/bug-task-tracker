'use client';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'closed' | 'pending-approval';
  assigneeId: string;
  assigneeName: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  timeSpent: number; // in minutes
  timeEntries: TimeEntry[];
  tags: string[];
}

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  duration: number; // in minutes
  description: string;
  date: Date;
}

let tasks: Task[] = [
  {
    id: '1',
    title: 'Login page authentication bug',
    description: 'Users are unable to login with correct credentials on mobile devices',
    priority: 'high',
    status: 'in-progress',
    assigneeId: '1',
    assigneeName: 'John Developer',
    createdBy: 'Sarah Manager',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16'),
    dueDate: new Date('2024-01-20'),
    timeSpent: 180,
    timeEntries: [
      {
        id: 'te1',
        taskId: '1',
        userId: '1',
        userName: 'John Developer',
        duration: 120,
        description: 'Investigated mobile authentication flow',
        date: new Date('2024-01-15')
      },
      {
        id: 'te2',
        taskId: '1',
        userId: '1',
        userName: 'John Developer',
        duration: 60,
        description: 'Fixed mobile-specific CSS issues',
        date: new Date('2024-01-16')
      }
    ],
    tags: ['authentication', 'mobile', 'urgent']
  },
  {
    id: '2',
    title: 'Database connection timeout',
    description: 'Application experiencing intermittent database timeouts during peak hours',
    priority: 'critical',
    status: 'open',
    assigneeId: '1',
    assigneeName: 'John Developer',
    createdBy: 'Sarah Manager',
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17'),
    dueDate: new Date('2024-01-18'),
    timeSpent: 0,
    timeEntries: [],
    tags: ['database', 'performance', 'critical']
  },
  {
    id: '3',
    title: 'UI inconsistency in dashboard',
    description: 'Button styles are inconsistent across different dashboard widgets',
    priority: 'medium',
    status: 'pending-approval',
    assigneeId: '1',
    assigneeName: 'John Developer',
    createdBy: 'Sarah Manager',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-14'),
    timeSpent: 90,
    timeEntries: [
      {
        id: 'te3',
        taskId: '3',
        userId: '1',
        userName: 'John Developer',
        duration: 90,
        description: 'Standardized button components',
        date: new Date('2024-01-14')
      }
    ],
    tags: ['ui', 'design']
  }
];

let timeEntries: TimeEntry[] = [];

export const getTasks = (): Task[] => {
  if (typeof window === 'undefined') return [];
  const savedTasks = localStorage.getItem('tasks');
  if (savedTasks) {
    const parsed = JSON.parse(savedTasks);
    return parsed.map((task: any) => ({
      ...task,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      timeEntries: task.timeEntries?.map((entry: any) => ({
        ...entry,
        date: new Date(entry.date)
      })) || []
    }));
  }
  // Save initial tasks to localStorage
  saveTasks(tasks);
  return tasks;
};

const saveTasks = (tasksToSave: Task[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('tasks', JSON.stringify(tasksToSave));
  }
};

export const createTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'timeSpent' | 'timeEntries'>): Task => {
  const newTask: Task = {
    ...taskData,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
    timeSpent: 0,
    timeEntries: []
  };
  
  const currentTasks = getTasks();
  const updatedTasks = [...currentTasks, newTask];
  saveTasks(updatedTasks);
  return newTask;
};

export const updateTask = (id: string, updates: Partial<Task>): Task | null => {
  const currentTasks = getTasks();
  const taskIndex = currentTasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) return null;
  
  const updatedTask = {
    ...currentTasks[taskIndex],
    ...updates,
    updatedAt: new Date()
  };
  
  currentTasks[taskIndex] = updatedTask;
  saveTasks(currentTasks);
  return updatedTask;
};

export const deleteTask = (id: string): boolean => {
  const currentTasks = getTasks();
  const filteredTasks = currentTasks.filter(t => t.id !== id);
  saveTasks(filteredTasks);
  return true;
};

export const addTimeEntry = (taskId: string, timeEntry: Omit<TimeEntry, 'id' | 'taskId'>): TimeEntry => {
  const newEntry: TimeEntry = {
    ...timeEntry,
    id: Date.now().toString(),
    taskId
  };
  
  const currentTasks = getTasks();
  const taskIndex = currentTasks.findIndex(t => t.id === taskId);
  
  if (taskIndex !== -1) {
    currentTasks[taskIndex].timeEntries.push(newEntry);
    currentTasks[taskIndex].timeSpent += newEntry.duration;
    currentTasks[taskIndex].updatedAt = new Date();
    saveTasks(currentTasks);
  }
  
  return newEntry;
};

export const getTasksByAssignee = (assigneeId: string): Task[] => {
  return getTasks().filter(task => task.assigneeId === assigneeId);
};

export const getTasksByStatus = (status: Task['status']): Task[] => {
  return getTasks().filter(task => task.status === status);
};

export const getTaskAnalytics = () => {
  const allTasks = getTasks();
  const totalTasks = allTasks.length;
  const openTasks = allTasks.filter(t => t.status === 'open').length;
  const inProgressTasks = allTasks.filter(t => t.status === 'in-progress').length;
  const closedTasks = allTasks.filter(t => t.status === 'closed').length;
  const pendingApprovalTasks = allTasks.filter(t => t.status === 'pending-approval').length;
  
  return {
    totalTasks,
    openTasks,
    inProgressTasks,
    closedTasks,
    pendingApprovalTasks,
    highPriorityTasks: allTasks.filter(t => t.priority === 'high' || t.priority === 'critical').length,
    totalTimeSpent: allTasks.reduce((total, task) => total + task.timeSpent, 0)
  };
};