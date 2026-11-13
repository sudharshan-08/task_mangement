# TaskFlow – End User Guide

Welcome to **TaskFlow**, your personal task management companion designed to bring clarity, speed, and focus to your daily workflow.

This guide provides simple, non-technical instructions for getting started, managing your tasks, and understanding how your data is protected.

---

## 1. How to Access the Application

1. Open your web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari).
2. Enter the web address provided by your system administrator or host (e.g., `http://localhost:3000` for local evaluation, or `https://your-domain.vercel.app` for production).
3. If you are not signed in, TaskFlow will automatically guide you to the secure **Login Screen**.

---

## 2. How to Sign In

TaskFlow uses your Google Account for fast and secure authentication without needing to remember another password.

### Signing in with your Google Account:
1. On the Login Screen, click the **Continue with Google** button.
2. A Google sign-in window will open.
3. Select or enter your Google account credentials.
4. When prompted, grant permissions to sign in to TaskFlow.
5. Upon successful verification, you will be redirected straight to your personal **Dashboard**.
6. Your profile picture and name will appear in the top-right corner of the application header.

### Exploring via Instant Demo Mode (For Evaluators):
If you are evaluating TaskFlow in an offline or local development environment where Google OAuth credentials have not yet been configured:
1. Click the button labeled **Explore Demo Workspace (Instant Access)**.
2. You will instantly enter the dashboard with a pre-configured sample workspace (`Alex Morgan`), allowing you to test every single feature immediately without setup delays.

---

## 3. Understanding the Dashboard

Once signed in, you will see two primary sections:

1. **Task Overview (Summary Cards)**:
   - **Planned Tasks**: The number of tasks scheduled to start.
   - **In Progress Tasks**: The number of tasks currently actively being worked on.
   - **Completed Tasks**: The number of tasks successfully finished.
   - **Progress Pill**: Displays total task count and workspace completion percentage.
2. **Your Tasks Section**:
   - Contains a search bar, filter tabs, a refresh button, and a **Create Task** button.
   - Displays your tasks in organized cards.

---

## 4. How to Create a New Task

1. Click the blue **Create Task** button located in the top-right of the task section.
2. A **Create New Task** dialog will appear.
3. **Task Title (Mandatory)**:
   - Type a concise title for your task (e.g., *"Prepare quarterly customer presentation"*).
   - If left blank, TaskFlow will notify you that a title is required.
4. **Description (Optional)**:
   - Enter any helpful background notes, links, or sub-steps.
5. **Initial Status**:
   - Every new task is automatically created with the status **Planned**.
6. Click **Save Task**.
7. Your task is immediately saved, a confirmation message appears, and the new task is shown at the top of your workspace.

---

## 5. How to View and Search Tasks

### Viewing Tasks
- Each task card displays its title, description, creation date, last updated date, and a color-coded status badge:
  - **Neutral Grey**: Planned.
  - **Blue**: In Progress.
  - **Green**: Complete.

### Searching and Filtering
- **Search Bar**: Type any keyword in the search bar. TaskFlow filters your tasks in real time as you type, matching both task titles and descriptions. Click **Clear** to reset.
- **Filter Tabs**: Click on **All**, **Planned**, **In Progress**, or **Complete** to view only tasks in that specific state. The number next to each tab indicates how many tasks are in that state.

---

## 6. How to Update Task Status

TaskFlow supports a streamlined 3-stage lifecycle:
1. **Planned**
2. **In Progress**
3. **Complete**

### Changing Status:
1. Locate the task card you wish to update.
2. Click the **Change status** button in the lower-right corner of the card.
3. Choose the new status from the dropdown list:
   - Select **In Progress** when you start active work on the task.
   - Select **Complete** when the work has finished.
   - You can also move a completed task back to **Planned** or **In Progress** if needed.
4. The status badge will change immediately, the task summary counters will automatically update, and a confirmation toast will appear.

---

## 7. How to Sign Out

1. Locate the application header at the top right of your screen.
2. Click the **Sign out** button next to your name.
3. Your secure session will be cleared, and you will be returned to the Login screen.
4. Any attempt to access `/dashboard` without signing back in will be automatically blocked.

---

## 8. Important Assumptions & Scope

To ensure optimal speed, clarity, and reliability:
- **Google Only**: Authentication is currently supported exclusively through Google accounts.
- **Personal Workspace**: You can only view and manage your own tasks. Other users cannot see or modify your tasks.
- **Required Fields**: Task titles are required; task descriptions are optional.
- **Three Fixed States**: Tasks operate strictly within the Planned, In Progress, and Complete states. Additional custom statuses are not included.
- **Editing & Deletion**: In accordance with the initial assessment scope, editing of existing titles/descriptions and permanent deletion are outside the mandatory scope.

---

## 9. Important Warnings & Security Notes

- **Network Connection**: If working online with Supabase, ensure you have an active internet connection. If your connection drops, status updates will alert you with an error notice.
- **Session Expiry**: If your Google session expires, sign out and sign back in to refresh your security credentials.
- **Do Not Share Sensitive API Keys**: Keep database keys private. Never post internal configuration files to public forums.
