'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/AuthGuard';
import { Layout } from '@/components/Layout';
import { TaskCard } from '@/components/TaskCard';
import { TaskForm } from '@/components/TaskForm';
import { TimeTrackingDialog } from '@/components/TimeTrackingDialog';
import { TaskFilters, TaskFilterState } from '@/components/TaskFilters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  getTasks, 
  updateTask, 
  deleteTask, 
  createTask, 
  getTaskAnalytics,
  Task 
} from '@/lib/tasks';
import { 
  Plus, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Users,
  BarChart3
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTimeTracking, setShowTimeTracking] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [trackingTask, setTrackingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<TaskFilterState>({
    search: '',
    status: 'all',
    priority: 'all',
    assignee: 'all',
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  });

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tasks, filters]);

  const loadTasks = () => {
    const allTasks = getTasks();
    setTasks(allTasks);
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    // Apply priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    // Apply assignee filter
    if (filters.assignee !== 'all') {
      filtered = filtered.filter(task => task.assigneeName === filters.assignee);
    }

    // Apply role-based filtering
    if (user?.role === 'developer') {
      filtered = filtered.filter(task => task.assigneeId === user.id);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'priority':
          const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'dueDate':
          aValue = a.dueDate ? a.dueDate.getTime() : 0;
          bValue = b.dueDate ? b.dueDate.getTime() : 0;
          break;
        case 'createdAt':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        default:
          aValue = a.updatedAt.getTime();
          bValue = b.updatedAt.getTime();
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredTasks(filtered);
  };

  const handleCreateTask = (taskData: Partial<Task>) => {
    createTask({
      ...taskData,
      assigneeId: taskData.assigneeId || user!.id,
      assigneeName: taskData.assigneeName || user!.name,
      createdBy: user!.name
    } as Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'timeSpent' | 'timeEntries'>);
    loadTasks();
  };

  const handleEditTask = (taskData: Partial<Task>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      loadTasks();
      setEditingTask(undefined);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    loadTasks();
  };

  const handleStatusChange = (taskId: string, status: Task['status']) => {
    updateTask(taskId, { status });
    loadTasks();
  };

  const handleTimeTrack = (task: Task) => {
    setTrackingTask(task);
    setShowTimeTracking(true);
  };

  const analytics = getTaskAnalytics();

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <AuthGuard>
      <Layout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                {user?.role === 'manager' ? 'Manager Dashboard' : 'Developer Dashboard'}
              </h1>
              <p className="text-muted-foreground">
                {user?.role === 'manager' 
                  ? 'Overview of all team tasks and approvals' 
                  : 'Manage your assigned tasks and track your time'
                }
              </p>
            </div>
            
            <Button onClick={() => setShowTaskForm(true)} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </Button>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalTasks}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.highPriorityTasks} high priority
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.inProgressTasks}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.openTasks} open tasks
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.pendingApprovalTasks}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting manager review
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatTime(analytics.totalTimeSpent)}</div>
                <p className="text-xs text-muted-foreground">
                  Total logged time
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <TaskFilters
            filters={filters}
            onFiltersChange={setFilters}
            tasks={tasks}
          />

          {/* Tasks Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Tasks ({filteredTasks.length})
              </h2>
              
              {user?.role === 'manager' && analytics.pendingApprovalTasks > 0 && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  {analytics.pendingApprovalTasks} pending approval
                </Badge>
              )}
            </div>

            {filteredTasks.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <CheckCircle className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No tasks found</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {filters.search || filters.status !== 'all' || filters.priority !== 'all' || filters.assignee !== 'all'
                      ? 'Try adjusting your filters or search terms'
                      : 'Create your first task to get started'
                    }
                  </p>
                  <Button onClick={() => setShowTaskForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Task
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={setEditingTask}
                    onDelete={handleDeleteTask}
                    onStatusChange={handleStatusChange}
                    onTimeTrack={handleTimeTrack}
                    userRole={user?.role}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Task Form Dialog */}
        <TaskForm
          task={editingTask}
          isOpen={showTaskForm || !!editingTask}
          onClose={() => {
            setShowTaskForm(false);
            setEditingTask(undefined);
          }}
          onSubmit={editingTask ? handleEditTask : handleCreateTask}
          currentUserId={user?.id || ''}
          currentUserName={user?.name || ''}
        />

        {/* Time Tracking Dialog */}
        <TimeTrackingDialog
          task={trackingTask}
          isOpen={showTimeTracking}
          onClose={() => {
            setShowTimeTracking(false);
            setTrackingTask(null);
          }}
          userId={user?.id || ''}
          userName={user?.name || ''}
          onTimeAdded={loadTasks}
        />
      </Layout>
    </AuthGuard>
  );
}