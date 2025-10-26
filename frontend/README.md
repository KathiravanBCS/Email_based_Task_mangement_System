# Task Management System - Frontend

A modern React frontend for the Task Management System built with Vite, Mantine UI, and React Query.

## Features

- 🎨 **Beautiful UI** - Built with Mantine UI components
- 🔐 **Authentication** - Login and registration with JWT
- 📊 **Dashboard** - Statistics and charts
- ✅ **Task Management** - Create, edit, delete tasks
- 📅 **Calendar View** - Visualize tasks by date
- 📋 **Kanban Board** - Drag-and-drop task management
- 🔔 **Notifications** - Real-time notifications
- 🌓 **Dark Mode** - Light and dark theme support
- 📱 **Responsive** - Works on all devices

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **Mantine UI 7** - Component library
- **React Query** - Data fetching and caching
- **React Router** - Routing
- **Zustand** - State management
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Day.js** - Date formatting

## Prerequisites

- Node.js >= 16.x
- npm or yarn
- Backend API running on http://localhost:5000

## Installation

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
copy .env.example .env
```

4. **Configure environment variables**
```env
VITE_API_URL=http://localhost:5000/api
```

5. **Start development server**
```bash
npm run dev
```

Application will be available at http://localhost:3000

## Build for Production

```bash
npm run build
```

Build output will be in the `dist` directory.

## Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components
│   │   └── Tasks/
│   ├── layouts/          # Layout components
│   │   ├── AuthLayout.jsx
│   │   └── MainLayout.jsx
│   ├── pages/            # Page components
│   │   ├── Auth/
│   │   ├── Dashboard/
│   │   ├── Tasks/
│   │   ├── Categories/
│   │   ├── Notifications/
│   │   ├── Settings/
│   │   └── Profile/
│   ├── services/         # API services
│   │   └── api.js
│   ├── store/            # State management
│   │   └── authStore.js
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── index.html
├── vite.config.js
└── package.json
```

## Default Credentials

After setting up the backend:
- **Email:** admin@taskmanager.com
- **Password:** admin123

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features Overview

### Dashboard
- Task statistics cards
- Completion rate chart
- Priority distribution
- Quick stats overview

### Task Management
- List view with filters
- Create/Edit/Delete tasks
- Task status and priority
- Category assignment
- Due date tracking

### Kanban Board
- Visual task organization
- Status-based columns
- Task cards with details

### Authentication
- Secure login/register
- JWT token management
- Auto token refresh
- Protected routes

## API Integration

The frontend communicates with the backend API using Axios. All API calls are defined in `src/services/api.js`.

Authentication token is automatically attached to requests using Axios interceptors.

## State Management

- **Zustand** for global state (authentication)
- **React Query** for server state (API data)
- **Mantine hooks** for component state

## Styling

Uses Mantine UI theme system. Customize theme in `src/main.jsx`:

```jsx
<MantineProvider
  theme={{
    primaryColor: 'blue',
    // Add custom theme options
  }}
>
```

## Environment Variables

- `VITE_API_URL` - Backend API base URL

## Troubleshooting

**Cannot connect to API:**
- Ensure backend is running on port 5000
- Check VITE_API_URL in .env
- Verify CORS settings in backend

**Build fails:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Port 3000 in use:**
Change port in vite.config.js or run:
```bash
npm run dev -- --port 3001
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

ISC
