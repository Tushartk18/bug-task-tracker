'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { getTasks } from '@/lib/tasks';
import { getAllUsers } from '@/lib/auth';
import { Users, Clock, CheckCircle, TrendingUp } from 'lucide-react';

export const TeamPerformanceChart: React.FC = () => {
  const [teamData, setTeamData] = useState<any[]>([]);
  const [timeData, setTimeData] = useState<any[]>([]);

  useEffect(() => {
    generateTeamData();
  }, []);

  const generateTeamData = () => {
    const tasks = getTasks();
    const users = getAllUsers();
    const developers = users.filter(user => user.role === 'developer');

    const teamPerformance = developers.map(developer => {
      const developerTasks = tasks.filter(task => task.assigneeId === developer.id);
      const completedTasks = developerTasks.filter(task => task.status === 'closed');
      const inProgressTasks = developerTasks.filter(task => task.status === 'in-progress');
      const totalTimeSpent = developerTasks.reduce((total, task) => total + task.timeSpent, 0);

      return {
        name: developer.name.split(' ')[0], // First name only for chart
        fullName: developer.name,
        avatar: developer.avatar,
        totalTasks: developerTasks.length,
        completedTasks: completedTasks.length,
        inProgressTasks: inProgressTasks.length,
        timeSpent: Math.round(totalTimeSpent / 60 * 10) / 10, // Convert to hours with 1 decimal
        completionRate: developerTasks.length > 0 ? Math.round((completedTasks.length / developerTasks.length) * 100) : 0
      };
    });

    setTeamData(teamPerformance);

    // Time distribution data
    const timeDistribution = teamPerformance.map(dev => ({
      name: dev.name,
      hours: dev.timeSpent
    }));

    setTimeData(timeDistribution);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Team Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {teamData.map((member, index) => (
          <Card key={member.fullName}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={member.avatar} alt={member.fullName} />
                  <AvatarFallback>{member.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{member.fullName}</p>
                  <p className="text-xs text-muted-foreground">Developer</p>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tasks</span>
                  <span className="font-medium">{member.totalTasks}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-medium text-green-600">{member.completedTasks}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">{member.timeSpent}h</span>
                </div>
                <div className="pt-2">
                  <Badge 
                    variant="outline" 
                    className={`w-full justify-center ${
                      member.completionRate >= 80 ? 'border-green-200 text-green-800' :
                      member.completionRate >= 60 ? 'border-yellow-200 text-yellow-800' :
                      'border-red-200 text-red-800'
                    }`}
                  >
                    {member.completionRate}% Complete
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Completion Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Task Completion by Developer</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teamData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    value, 
                    name === 'completedTasks' ? 'Completed' : 
                    name === 'inProgressTasks' ? 'In Progress' : 'Total'
                  ]}
                />
                <Bar dataKey="completedTasks" fill="#10b981" name="Completed" />
                <Bar dataKey="inProgressTasks" fill="#f59e0b" name="In Progress" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Time Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Time Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={timeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}h`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="hours"
                >
                  {timeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}h`, 'Hours']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Team Performance Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {teamData.reduce((sum, member) => sum + member.totalTasks, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {teamData.reduce((sum, member) => sum + member.completedTasks, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Completed Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {teamData.reduce((sum, member) => sum + member.timeSpent, 0).toFixed(1)}h
              </div>
              <div className="text-sm text-muted-foreground">Total Hours</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};