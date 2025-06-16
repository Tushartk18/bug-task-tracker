'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  User, 
  Calendar,
  MessageSquare,
  Timer
} from 'lucide-react';
import { getTasks, updateTask, Task } from '@/lib/tasks';
import { format } from 'date-fns';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ApprovalQueueProps {
  onTaskUpdate?: () => void;
}

export const ApprovalQueue: React.FC<ApprovalQueueProps> = ({ onTaskUpdate }) => {
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [approvalComment, setApprovalComment] = useState('');

  useEffect(() => {
    loadPendingTasks();
  }, []);

  const loadPendingTasks = () => {
    const tasks = getTasks();
    const pending = tasks.filter(task => task.status === 'pending-approval');
    setPendingTasks(pending);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const handleApprovalAction = (task: Task, action: 'approve' | 'reject') => {
    setSelectedTask(task);
    setApprovalAction(action);
    setShowApprovalDialog(true);
  };

  const submitApproval = () => {
    if (!selectedTask) return;

    const newStatus = approvalAction === 'approve' ? 'closed' : 'in-progress';
    
    updateTask(selectedTask.id, { 
      status: newStatus,
      // Add approval comment to task description or create a comment system
      description: approvalComment 
        ? `${selectedTask.description}\n\n--- Manager ${approvalAction === 'approve' ? 'Approval' : 'Rejection'} ---\n${approvalComment}`
        : selectedTask.description
    });

    setShowApprovalDialog(false);
    setSelectedTask(null);
    setApprovalComment('');
    loadPendingTasks();
    onTaskUpdate?.();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (pendingTasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>Approval Queue</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">All caught up!</h3>
            <p className="text-muted-foreground">No tasks pending approval at the moment.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <span>Approval Queue</span>
            </div>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              {pendingTasks.length} pending
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingTasks.map((task) => (
              <div key={task.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{task.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  </div>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{task.assigneeName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{format(new Date(task.updatedAt), 'MMM dd')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Timer className="w-4 h-4 text-muted-foreground" />
                    <span>{formatTime(task.timeSpent)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {task.dueDate 
                        ? format(new Date(task.dueDate), 'MMM dd')
                        : 'No due date'
                      }
                    </span>
                  </div>
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

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    Submitted {format(new Date(task.updatedAt), 'MMM dd, yyyy HH:mm')}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApprovalAction(task, 'reject')}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprovalAction(task, 'approve')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? 'Approve Task' : 'Reject Task'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedTask && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium">{selectedTask.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Assigned to: {selectedTask.assigneeName}
                </p>
                <p className="text-sm text-muted-foreground">
                  Time spent: {formatTime(selectedTask.timeSpent)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="approval-comment">
                  {approvalAction === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason'}
                </Label>
                <Textarea
                  id="approval-comment"
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  placeholder={
                    approvalAction === 'approve' 
                      ? 'Add any notes about the approval...'
                      : 'Please provide a reason for rejection...'
                  }
                  rows={3}
                  required={approvalAction === 'reject'}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowApprovalDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={submitApproval}
              className={approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              disabled={approvalAction === 'reject' && !approvalComment.trim()}
            >
              {approvalAction === 'approve' ? 'Approve Task' : 'Reject Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};