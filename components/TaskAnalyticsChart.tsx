'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { getTasks, getTaskAnalytics } from '@/lib/tasks';
import { format, subDays, startOfDay } from 'date-fns';
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

interface TaskAnalyticsChartProps {
  userRole?: 'developer' | 'manager';
  userId?: string;
}

export const TaskAnalyticsChart: React.FC<TaskAnalyticsChartProps> = ({ 
  userRole = 'developer', 
  userId 
}) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [priorityData, setPriorityData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);

  useEffect(() => {
    generateChartData();
  }, [userRole, userId]);

  const generateChartData = () => {
    const tasks = getTasks();
    const filteredTasks = userRole === 'developer' && userId 
      ? tasks.filter(task => task.assigneeId === userId)
      : tasks;

    // Generate last 7 days data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 6 - i));
      const dayTasks = filteredTasks.filter(task => {
        const taskDate = startOfDay(new Date(task.createdAt));
        return taskDate.getTime() === date.getTime();
      });

      const completedTasks = filteredTasks.filter(task => {
        const taskDate = startOfDay(new Date(task.updatedAt));
        return taskDate.getTime() === date.getTime() && task.status === 'closed';
      });

      return {
        date: format(date, 'MMM dd'),
        created: dayTasks.length,
        completed: completedTasks.length,
        timeSpent: dayTasks.reduce((total, task) => total + task.timeSpent, 0) / 60 // Convert to hours
      };
    });

    setChartData(last7Days);

    // Priority distribution
    const priorityCount = {
      low: filteredTasks.filter(t => t.priority === 'low').length,
      medium: filteredTasks.filter(t => t.priority === 'medium').length,
      high: filteredTasks.filter(t => t.priority === 'high').length,
      critical: filteredTasks.filter(t => t.priority === 'critical').length
    };

    const priorityChartData = Object.entries(priorityCount).map(([priority, count]) => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      value: count,
      color: priority === 'low' ? '#10b981' : 
             priority === 'medium' ? '#f59e0b' :
             priority === 'high' ? '#f97316' : '#ef4444'
    }));

    setPriorityData(priorityChartData);

    // Status distribution
    const statusCount = {
      open: filteredTasks.filter(t => t.status === 'open').length,
      'in-progress': filteredTasks.filter(t => t.status === 'in-progress').length,
      'pending-approval': filteredTasks.filter(t => t.status === 'pending-approval').length,
      closed: filteredTasks.filter(t => t.status === 'closed').length
    };

    const statusChartData = Object.entries(statusCount).map(([status, count]) => ({
      name: status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: count
    }));

    setStatusData(statusChartData);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Task Trend Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Task Activity Trend (Last 7 Days)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="created" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="Tasks Created"
              />
              <Line 
                type="monotone" 
                dataKey="completed" 
                stroke="#82ca9d" 
                strokeWidth={2}
                name="Tasks Completed"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Time Spent Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Time Spent (Hours)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value.toFixed(1)}h`, 'Hours']} />
              <Bar dataKey="timeSpent" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Priority Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChartIcon className="w-5 h-5" />
            <span>Priority Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Status Overview */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statusData.map((status, index) => (
              <div key={status.name} className="text-center">
                <div className="text-2xl font-bold text-primary">{status.value}</div>
                <div className="text-sm text-muted-foreground">{status.name}</div>
                <Badge 
                  variant="outline" 
                  className="mt-1"
                  style={{ borderColor: COLORS[index % COLORS.length] }}
                >
                  {status.value > 0 ? `${((status.value / statusData.reduce((sum, s) => sum + s.value, 0)) * 100).toFixed(0)}%` : '0%'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};