'use client';

import { Task } from '@/lib/tasks';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Clock, 
  Calendar, 
  User, 
  Edit, 
  Trash2, 
  Play, 
  CheckCircle, 
  AlertCircle,
  Timer
} from 'lucide-react';
import { format } from 'date-fns';

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

const statusColors = {
  open: 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-purple-100 text-purple-800',
  closed: 'bg-green-100 text-green-800',
  'pending-approval': 'bg-orange-100 text-orange-800'
};

const statusIcons = {
  open: AlertCircle,
  'in-progress': Play,
  closed: CheckCircle,
  'pending-approval': Clock
};

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: Task['status']) => void;
  onTimeTrack?: (task: Task) => void;
  showActions?: boolean;
  userRole?: 'developer' | 'manager';
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  onTimeTrack,
  showActions = true,
  userRole = 'developer'
}) => {
  const StatusIcon = statusIcons[task.status];
  
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const canEdit = userRole === 'developer' || userRole === 'manager';
  const canDelete = userRole === 'manager';
  const canApprove = userRole === 'manager' && task.status === 'pending-approval';
  const canClose = userRole === 'developer' && task.status === 'in-progress';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold line-clamp-2">{task.title}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
            <Badge className={statusColors[task.status]}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {task.status.replace('-', ' ')}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">{task.description}</p>
        
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <User className="w-4 h-4" />
            <span>{task.assigneeName}</span>
          </div>
          
          {task.dueDate && (
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{format(task.dueDate, 'MMM dd')}</span>
            </div>
          )}
          
          {task.timeSpent > 0 && (
            <div className="flex items-center space-x-1">
              <Timer className="w-4 h-4" />
              <span>{formatTime(task.timeSpent)}</span>
            </div>
          )}
        </div>
        
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      
      {showActions && (
        <CardFooter className="pt-3 border-t">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              {canEdit && onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(task)}>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
              
              {userRole === 'developer' && onTimeTrack && (
                <Button variant="outline" size="sm" onClick={() => onTimeTrack(task)}>
                  <Clock className="w-4 h-4 mr-1" />
                  Log Time
                </Button>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {canClose && onStatusChange && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onStatusChange(task.id, 'pending-approval')}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Close
                </Button>
              )}
              
              {canApprove && onStatusChange && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onStatusChange(task.id, 'closed')}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onStatusChange(task.id, 'in-progress')}
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Reopen
                  </Button>
                </>
              )}
              
              {canDelete && onDelete && (
                <Button variant="destructive" size="sm" onClick={() => onDelete(task.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};