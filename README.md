FealtyX - Bug/Task Tracker Interface

A full-featured bug and task tracking web application built using **Next.js** and **TypeScript**. Designed with a focus on clean UI/UX, role-based dashboards, and developer/manager workflows.

Features

User Authentication & Roles
- Simple login with mock authentication using hardcoded credentials.
- Role-based access: `Developer` and `Manager`.
- Redirect to role-specific dashboards upon login.

Dashboards
- **Developer Dashboard**: View, create, edit, delete, and manage personal tasks and bugs.
- **Manager Dashboard**: Monitor all bugs (open/closed), track team performance, and approve task closures.
- Visual trendline of tasks worked on each day (for both roles).

 Task/Bug Management
- Create tasks/bugs with:
  - Title, Description, Priority, Status, Assignee, Dates, etc.
- Edit and delete existing tasks.
- Filter and sort tasks by status, priority, and other criteria.
- Bug closure flow:
  - Developer closes bug → Sent to Manager for approval.
  - Bug enters "Pending Approval" state until Manager acts.
  - Manager can approve or reopen the bug.

 Time Tracker
- Log time spent on individual tasks.
- View total hours logged per task.
- Manager dashboard includes developer-wise time tracking overview.

  Tech Stack
- **Framework:** Next.js 
- **Language:** TypeScript
- **Styling:** CSS 
- **State Management:** 
- **Charting Library:** 

 🌐 Live Demo