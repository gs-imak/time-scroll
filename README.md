
This is the repository for the project of Lycia Djemili & Georges Simak 
# Historical Timeline Map - time-scroll
Journey through time with our interactive historical mapping application. This project allows users to explore world history through an intuitive map interface, discovering events, cultural developments, and significant moments that shaped our world.

## Overview

The Historical Timeline Map is a web-based application that combines geographical visualization with historical data to create an immersive learning experience. Users can navigate through different time periods, explore historical events, and understand how our world has evolved over time.

## Features

Our application provides an engaging way to explore history through several key features:

The interactive world map serves as the primary interface, displaying historical events and changing geographical boundaries as users navigate through time. Users can zoom, pan, and click on various markers to learn more about specific events.

The timeline control system enables smooth navigation through different historical periods. Users can play through time automatically, pause at interesting moments, or jump to specific dates of interest.

Our event system categorizes historical moments into various types, including wars, discoveries, cultural developments, and natural disasters. Each event provides detailed information, images, and links to additional resources.

The filtering system allows users to focus on specific types of events or geographical regions, making it easy to study particular aspects of history or specific areas of interest.

## Getting Started

### Prerequisites

Before you begin, ensure you have installed:
- Node.js (v16.0.0 or higher)
- npm (v7.0.0 or higher)
- Git

### Installation

First, clone the repository to your local machine:

```bash
git clone https://github.com/yourusername/historical-timeline-map.git
cd historical-timeline-map
```

Install the required dependencies:

```bash
npm install
```

Create a .env file in the root directory and add the necessary environment variables:

```env
REACT_APP_API_URL=your_api_url
REACT_APP_MAP_TOKEN=your_map_token
```

Start the development server:

```bash
npm start
npm run web      # Start web app
npm run desktop  # Start desktop app
npm run mobile   # Start mobile app
npm run backend  # Start backend
npm run dev      # Start web + backend
```

The application will be available at http://localhost:3000

## Project Structure

Our project follows a clean and organized structure:

```
│── backend/                 # Backend API and database
│   ├── controllers/         # Handles API logic
│   ├── models/              # Database schemas
│   ├── routes/              # API routes
│   ├── services/            # Business logic (processing)
│   ├── app.js               # Main Express.js app
│   ├── database.js          # Database connection
│   ├── package.json         # Node.js dependencies
│   ├── .env                 # Environment variables
│   └── README.md            # Backend documentation
│
│── frontend/                # Frontend application
│   ├── public/              # Static files (HTML, CSS, images)
│   │   ├── index.html       # Main HTML page
│   │   ├── style.css        # Stylesheet
│   │   ├── assets/          # Static images or assets
│   │   ├── cesium/          # Cesium library (if not using CDN)
│   │   ├── models/          # 3D models (GLB, GLTF)
│   ├── src/                 # Core frontend logic
│   │   ├── components/      # Modular components (React/Vue/Svelte)
│   │   ├── utils/           # Helper functions
│   │   ├── api/             # API calls to backend
│   │   ├── App.js           # Main frontend app (React/Vue/Svelte)
│   │   ├── main.js          # Entry point for VanillaJS
│   ├── package.json         # Frontend dependencies
│   ├── vite.config.js       # Build configuration (if using Vite)
│   ├── webpack.config.js    # Webpack config (if using Webpack)
│   └── README.md            # Frontend documentation
│
│── docs/                    # Project documentation
│   ├── roadmap.md           # Development roadmap
│   ├── architecture.md      # System design overview
│   ├── setup.md             # Setup instructions
│
│── .gitignore               # Git ignored files
│── README.md                # Project overview
│── LICENSE                  # Open-source license
```

For a detailed breakdown of the file structure, please refer to our [File Structure Documentation](./docs/FILE_STRUCTURE.md).

## Development

### Code Style

We follow the Airbnb JavaScript Style Guide with some modifications. Our ESLint configuration enforces these standards:

```bash
npm run lint     # Check code style
npm run lint:fix # Automatically fix code style issues
```

### Testing

We use Jest and React Testing Library for testing. Run the test suite with:

```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Building

To create a production build:

```bash
npm run build
```

The built files will be in the `build/` directory.

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

For detailed information, see our [Contributing Guidelines](./CONTRIBUTING.md).

## Documentation

Additional documentation is available in the `docs/` directory:

- [API Documentation](./docs/API.md)
- [Component Documentation](./docs/COMPONENTS.md)
- [Development Guide](./docs/DEVELOPMENT.md)

## Roadmap

We have exciting plans for future development:

Phase 1 (Current):
- Basic map implementation
- Timeline slider functionality
- Simple event display system
- Basic user interface

Phase 2 (Upcoming):
- Historical event database integration
- Dynamic boundary changes
- Event categorization system
- Search functionality

Phase 3 (Future):
- User accounts
- Bookmarking system
- Advanced filtering
- Educational tools
- Mobile optimization

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

We would like to thank:
- The open-source community for their invaluable tools and libraries
- Historical data providers for their comprehensive databases
- Our contributors and supporters

## Contact

Project Lead - [@yourusername](https://twitter.com/yourusername)

Project Link: [https://github.com/yourusername/historical-timeline-map](https://github.com/yourusername/historical-timeline-map)

## Support

If you're having issues, please:
1. Check our [FAQ](./docs/FAQ.md)
2. Search through [Issues](https://github.com/yourusername/historical-timeline-map/issues)
3. Create a new issue if your problem persists

For urgent matters, contact our support team at support@yourdomain.com