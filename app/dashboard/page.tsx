Id: string) => {
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
                  ? 'Overview of all team tasks, analytics, and approvals' 
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

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tasks" className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Tasks</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </TabsTrigger>
              {user?.role === 'manager' && (
                <>
                  <TabsTrigger value="approvals" className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Approvals</span>
                    {analytics.pendingApprovalTasks > 0 && (
                      <Badge variant="secondary" className="ml-1 bg-orange-100 text-orange-800">
                        {analytics.pendingApprovalTasks}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="team" className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Team</span>
                  </TabsTrigger>
                </>
              )}
              {user?.role === 'developer' && (
                <TabsTrigger value="my-analytics" className="flex items-center space-x-2">
                  <PieChart className="w-4 h-4" />
                  <span>My Analytics</span>
                </TabsTrigger>
              )}
            </TabsList>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="space-y-6">
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
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <TaskAnalyticsChart userRole={user?.role} userId={user?.id} />
            </TabsContent>

            {/* Developer Analytics Tab */}
            {user?.role === 'developer' && (
              <TabsContent value="my-analytics" className="space-y-6">
                <TaskAnalyticsChart userRole="developer" userId={user.id} />
              </TabsContent>
            )}

            {/* Manager-only tabs */}
            {user?.role === 'manager' && (
              <>
                {/* Approvals Tab */}
                <TabsContent value="approvals" className="space-y-6">
                  <ApprovalQueue onTaskUpdate={loadTasks} />
                </TabsContent>

                {/* Team Tab */}
                <TabsContent value="team" className="space-y-6">
                  <TeamPerformanceChart />
                </TabsContent>
              </>
            )}
          </Tabs>
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