# TimeScroll - Interactive Historical Timeline Map

TimeScroll is an interactive historical timeline application that allows users to explore world history through an intuitive 3D map interface. Journey through time from ancient civilizations to the modern era, discovering events, cultural developments, and significant moments that shaped our world.

## Project Overview

TimeScroll combines geographical visualization with historical data to create an immersive learning experience. Users can navigate through different time periods, explore historical events, and understand how our world has evolved over time.

## Features

- **Interactive 3D Globe**: Powered by CesiumJS, offering smooth navigation and realistic terrain visualization
- **Time Navigation**: Intuitive timeline control system for navigating through different historical periods
- **Historical Events**: Explore events categorized by type (wars, discoveries, cultural developments, etc.)
- **Location-Based History**: Visit significant historical locations with detailed time-specific information
- **Era Transitions**: Visual effects for time travel between different historical periods
- **Responsive UI**: Modern interface adapting to different screen sizes and devices

## Tech Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **3D Visualization**: CesiumJS for globe rendering
- **State Management**: React Hooks
- **Styling**: CSS with some Styled Components
- **Animations**: GSAP for smooth transitions
- **3D Effects**: Three.js for special visual effects
- **Build Tool**: Vite

### Backend
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Real-time Communication**: Socket.IO for WebSocket connections

## Project Structure

```
│── frontend/                 # Frontend React application
│   ├── src/                  # Source code
│   │   ├── components/       # React components
│   │   │   ├── time-ui/      # Time navigation components
│   │   │   └── ...           # Other UI components
│   │   ├── styles/           # CSS styles
│   │   ├── lib/              # Utility libraries
│   │   ├── types/            # TypeScript type definitions
│   │   ├── constants/        # Constant values and data
│   │   ├── api/              # API communication
│   │   ├── utils/            # Helper functions
│   │   ├── App.tsx           # Main application component
│   │   └── main.tsx          # Application entry point
│   ├── public/               # Static assets
│   └── ...                   # Configuration files
│
│── backend/                  # NestJS backend
│   ├── src/                  # Source code
│   │   ├── database/         # Database configuration
│   │   ├── map/              # WebSocket gateway for map interactions
│   │   ├── health/           # Health check endpoints
│   │   └── ...               # Other modules
│   └── ...                   # Configuration files
```

## Key Components

### CesiumJS Integration
The application uses CesiumJS to create an interactive 3D globe visualization, allowing users to navigate to different geographical locations and view historical events in their spatial context.

### Time Navigation
The time navigation system includes:
- Global timeline slider for traversing through major historical periods
- Date wheel picker for precise date selection
- Era transition effects for time travel visualization

### Historical Events
Events are displayed on the map as interactive markers with:
- Categorization by type
- Detailed information panels
- Related imagery and additional resources

### Location-Based History
Special locations (like the Pyramids of Giza) feature:
- Time-specific information
- Visual reconstructions of historical states
- Animated transitions between time periods

## Getting Started

### Prerequisites
- Node.js (v16.0.0 or higher)
- npm (v7.0.0 or higher)
- PostgreSQL (for backend)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/gs-imak/time-scroll.git
cd time-scroll
```

2. Install dependencies for both frontend and backend:
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. Set up environment variables:
   - Create a `.env` file in the frontend directory with:
     ```
     VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
     VITE_CESIUM_ACCESS_TOKEN=your_cesium_token
     ```
   - Create a `.env` file in the backend directory with:
     ```
     DB_HOST=localhost
     DB_USER=your_db_user
     DB_PASS=your_db_password
     DB_NAME=your_db_name
     ```

4. Start the development servers:
```bash
# Start backend
cd backend
npm run start:dev

# Start frontend (in a new terminal)
cd frontend
npm run dev
```

5. The application will be available at http://localhost:5173

## Development

### Code Style
The project uses ESLint and Prettier for code style and formatting.

```bash
# Check code style
npm run lint

# Fix code style issues
npm run lint:fix
```

### Building for Production

```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd backend
npm run build
```

## Current Status

The project is currently in active development with the following components implemented:
- Basic 3D globe visualization with CesiumJS
- Time navigation controls
- Historical event markers
- Location-based time travel
- Interactive UI components
- Backend socket communication

## Future Roadmap

- Enhanced historical event database
- User accounts and saved journeys
- Educational tour guides
- Mobile application
- AR/VR integration
- Collaborative exploration features

## License

This project is licensed under the ISC License.
