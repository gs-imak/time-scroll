# Personal Setup Guide for time-scroll

This guide is specifically for setting up the time-scroll project on a Mac. It includes all necessary steps, environment configurations, and troubleshooting tips.

## Prerequisites

1. **Node.js and npm**
   ```bash
   # Install using Homebrew
   brew install node
   
   # Verify installation
   node --version  # Should be v16.0.0 or higher
   npm --version   # Should be v7.0.0 or higher
   ```

2. **PostgreSQL**
   ```bash
   # Install using Homebrew
   brew install postgresql@14
   
   # Start PostgreSQL service
   brew services start postgresql@14
   
   # Create a database
   createdb time_scroll_db
   ```

3. **Git**
   ```bash
   # Install using Homebrew
   brew install git
   ```

## Project Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/gs-imak/time-scroll.git
   cd time-scroll
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

4. **Configure Backend Environment**
   Create a `.env` file in the backend directory:
   ```env
   DB_HOST=localhost
   DB_USER=postgres
   DB_PASS=your_password
   DB_NAME=time_scroll_db
   PORT=3001
   ```

5. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

6. **Vite Configuration**
   - Keep only `vite.config.ts` and delete `vite.config.js`
   - The TypeScript version includes necessary Cesium configurations

## Running the Project

1. **Start Backend (Terminal 1)**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Start Frontend (Terminal 2)**
   ```bash
   cd frontend
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Common Issues and Solutions

1. **PostgreSQL Connection Issues**
   ```bash
   # Check if PostgreSQL is running
   brew services list
   
   # Restart PostgreSQL if needed
   brew services restart postgresql@14
   ```

2. **Node Modules Issues**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Remove node_modules and reinstall
   rm -rf node_modules
   npm install
   ```

3. **Port Conflicts**
   - If port 3001 is in use, modify PORT in backend/.env
   - If port 5173 is in use, Vite will automatically try the next available port

## Development Tips

1. **Database Management**
   ```bash
   # Access PostgreSQL CLI
   psql time_scroll_db
   
   # List all tables
   \dt
   
   # Exit PostgreSQL CLI
   \q
   ```

2. **Logs**
   - Backend logs are in the terminal running the backend
   - Frontend logs are in the browser console and terminal running the frontend

## Useful Commands

```bash
# Reset database (if needed)
dropdb time_scroll_db
createdb time_scroll_db

# Update dependencies
npm update

# Check for outdated packages
npm outdated

# Run tests (if configured)
npm test
```

## Notes

- This setup is specifically for Mac
- Keep your `.env` files secure and never commit them to Git
- The project uses TypeScript, so ensure your IDE has TypeScript support
- Cesium requires proper GPU support for optimal performance 