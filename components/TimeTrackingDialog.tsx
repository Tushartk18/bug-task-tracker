'use client';

import { useState } from 'react';
import { Task, TimeEntry, addTimeEntry } from '@/lib/tasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User } from 'lucide-react';
import { format } from 'date-fns';

interface TimeTrackingDialogProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  onTimeAdded: () => void;
}

export const TimeTrackingDialog: React.FC<TimeTrackingDialogProps> = ({
  task,
  isOpen,
  onClose,
  userId,
  userName,
  onTimeAdded
}) => {
  const [timeData, setTimeData] = useState({
    hours: '',
    minutes: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    
    const totalMinutes = (parseInt(timeData.hours) || 0) * 60 + (parseInt(timeData.minutes) || 0);
    
    if (totalMinutes > 0) {
      addTimeEntry(task.id, {
        userId,
        userName,
        duration: totalMinutes,
        description: timeData.description,
        date: new Date()
      });
      
      setTimeData({ hours: '', minutes: '', description: '' });
      onTimeAdded();
      onClose();
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Time Tracking - {task.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Total Time Spent: {formatTime(task.timeSpent)}</span>
              </CardTitle>
            </CardHeader>
            {task.timeEntries.length > 0 && (
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {task.timeEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>{entry.userName}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span>{formatTime(entry.duration)}</span>
                        <span className="text-muted-foreground">
                          {format(entry.date, 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hours">Hours</Label>
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  value={timeData.hours}
                  onChange={(e) => setTimeData(prev => ({ ...prev, hours: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="minutes">Minutes</Label>
                <Input
                  id="minutes"
                  type="number"
                  min="0"
                  max="59"
                  value={timeData.minutes}
                  onChange={(e) => setTimeData(prev => ({ ...prev, minutes: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Work Description</Label>
              <Textarea
                id="description"
                value={timeData.description}
                onChange={(e) => setTimeData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what you worked on..."
                rows={3}
                required
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Add Time Entry
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};