# TeamFlow

**Live App:** https://teamtaskmanager-tau-seven.vercel.app

TeamFlow is a full-stack team and project management application built for real workplace use. It lets you organize your team around projects, assign tasks with deadlines and priorities, and track progress in one place. Whether you're managing a small startup team or a growing department, TeamFlow gives admins the tools to stay on top of everything while giving team members a clear view of what they need to work on.

The app is built with Next.js on the frontend, Express.js on the backend, and MongoDB for data storage. Authentication is handled with JWTs, and the entire UI is styled with Tailwind CSS in a dark purple theme.

## What You Can Do

TeamFlow is built around two roles: Admin and Member. What you see and what you can do depends on which role you have.

**As an Admin**, you have full control. You can create and manage projects, add team members to those projects, create tasks and assign them to specific people, set deadlines and priorities, and delete anything that's no longer needed. The admin panel also gives you a bird's-eye view of everyone on the team, including their roles and designations. If you're a super admin, you can also change user roles and remove users from the system entirely.

**As a Member**, you log in and immediately see your assigned tasks on the dashboard. You can update the status of your tasks as you work through them, view the projects you're part of, and manage your own profile. You won't see controls that don't apply to you, which keeps the interface clean and focused.

## Features

**Authentication and Accounts**
Users sign up with their name, email, and password. Passwords are hashed before storage and login returns a JWT that's used for all protected requests. The session persists across page refreshes. Each user has a profile where they can update their name, add a mobile number and personal email, upload an avatar photo, and see their designation and role assigned by an admin.

**Dashboard**
The dashboard shows a summary of everything at a glance. Admins see total projects, tasks, and team members along with bar and pie charts showing task distribution by status. Members see their personally assigned tasks with statuses, priorities, and due dates so they always know what to focus on.

**Projects**
Admins can create projects with a title, description, deadline, status, and a selection of team members. Projects are shown as cards in a grid view. Clicking into a project opens a detail page showing the team, deadline, progress bar, and all tasks associated with that project. Tasks can be added, edited, and deleted directly from the project detail page.

**Tasks**
The tasks page shows all tasks relevant to the logged-in user. Each task shows its title, status, priority, assignee, and due date. Overdue tasks are flagged automatically. Members can update the status of tasks assigned to them. Admins can do everything including creating, editing, and deleting tasks.

**Admin Panel**
The admin panel has two views depending on your role. Super admins get a full user management table where they can change any user's access role between admin and member, update their designation, and remove users from the system. Regular admins see a read-only overview of users, recent projects, and task statistics.

**Profile Page**
Every user has a profile page where they can edit their display name, upload an avatar photo (shown across the sidebar and admin panel), add a mobile number and personal email for contact purposes. The designation and account role are shown read-only since those are managed by admins.

## Tech Stack

The frontend is built with Next.js 14 using the App Router and styled with Tailwind CSS. Charts are rendered using Recharts. API calls are made with Axios through a shared client with a base URL from environment variables.

The backend is a Node.js and Express.js REST API. It connects to MongoDB using Mongoose and handles authentication with JWTs via the `jsonwebtoken` package. Passwords are hashed with `bcryptjs`. The super admin account is seeded automatically on server startup if it doesn't exist.

## Getting Started Locally

You'll need Node.js 18 or later and a MongoDB Atlas account. If you don't have a MongoDB Atlas account, you can create one for free at mongodb.com/atlas.

**Step 1: Clone the repository**

```bash
git clone https://github.com/your-username/TeamManagement.git
```

**Step 2: Set up the backend**

Go into the backend folder and install dependencies.

```bash
cd TeamManagement/backend
npm install
```

Create a `.env` file in the backend folder with the following values:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/teammanagement
JWT_SECRET=your_super_secret_jwt_key_here_change_this
PORT=5000
CLIENT_URL=http://localhost:3000
```

`MONGO_URI` is the connection string from your MongoDB Atlas cluster. `JWT_SECRET` can be any long random string. `CLIENT_URL` tells the backend which frontend origin to allow for CORS.

Start the backend server:

```bash
npm run dev
```

The backend will run on port 5000. On first startup it will automatically create the super admin account using the email `outreach@ethara.ai`.

**Step 3: Set up the frontend**

Open a new terminal, go into the frontend folder, and install dependencies.

```bash
cd TeamManagement/frontend
npm install
```

Create a `.env.local` file in the frontend folder:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser. You should see the landing page. From there you can sign up for an account or log in if one already exists.

## How to Use It

Once you're running locally, here's the typical flow:

Sign up for an account. By default all new accounts are given the Member role. To get admin access, the super admin needs to upgrade your role from the Admin Panel. If you want to test admin features right away, log in with the super admin credentials and promote your account.

Once you have admin access, go to the Projects page and create a project. Add a title, an optional description, a deadline, and select team members from the list of registered users.

Inside the project, use the Add Task button to create tasks. Each task can be assigned to a specific team member, given a priority level (low, medium, or high), a due date, and a current status.

Team members will see their assigned tasks appear on their dashboard as soon as they're created. They can click into the task from the Tasks page and update the status as they make progress.

The Admin Panel under the sidebar gives admins a full overview of the team and lets the super admin manage roles and designations.

## Deploying to Production

**MongoDB Atlas** is needed for the production database. Create a free-tier cluster, add a database user with read and write access, and whitelist all IPs (0.0.0.0/0) so Railway can connect. Copy the connection string for use in your backend environment variables.

**Backend on Railway**

Push your code to a GitHub repository. Go to railway.app and create a new project from your GitHub repo. Set the root directory to `backend` in the Railway project settings. Add the following environment variables in the Railway dashboard: `MONGO_URI`, `JWT_SECRET`, `PORT` (set to 5000), and `CLIENT_URL` (your Vercel frontend URL, once you have it). Railway will detect Node.js and run `npm start`. Copy the deployment URL once it's live.

**Frontend on Vercel**

Go to vercel.com and import your GitHub repository. Set the root directory to `frontend`. Add one environment variable: `NEXT_PUBLIC_API_URL` set to your Railway backend URL. Deploy. Vercel handles the Next.js build automatically. Once deployed, go back to Railway and update `CLIENT_URL` to your Vercel URL to fix CORS.

## API Overview

The backend exposes a REST API under the `/api` prefix. Auth routes at `/api/auth` handle signup, login, and fetching the current user. Project routes at `/api/projects` support full CRUD with admin-only restrictions on create, update, and delete. Task routes at `/api/tasks` work similarly, with members only able to update the status field. User routes at `/api/users` let admins fetch the team list, and the super admin has additional routes to update roles, designations, and delete users.

All protected routes require a `Bearer` token in the `Authorization` header, which the frontend Axios client attaches automatically from localStorage.

## Author

Built by Harsh Kumar Singh | harsh.kumarint17@ethara.ai
