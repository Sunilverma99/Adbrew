# TODO Application

A full-stack TODO application built with React, Django, and MongoDB, containerized with Docker.

## Project Overview

This application provides a complete TODO management system with:
- **Frontend**: React application with hooks-based state management
- **Backend**: Django REST API
- **Database**: MongoDB for data persistence
- **Containerization**: Docker Compose for easy deployment

## Project Structure

```
.
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile              # Multi-stage Docker image with Python and Node.js
├── .gitignore              # Git ignore rules for the project
├── src/
│   ├── app/                # React frontend application
│   │   ├── src/
│   │   │   ├── App.js      # Main React component
│   │   │   ├── services/   # API service layer
│   │   │   └── components/ # Reusable React components
│   │   └── package.json    # Node.js dependencies
│   ├── rest/               # Django backend application
│   │   ├── manage.py       # Django management script
│   │   └── rest/           # Django project settings
│   ├── requirements.txt    # Python dependencies
│   └── db/                 # MongoDB data directory (gitignored)
```

## Architecture

The application consists of 3 Docker containers:

1. **App Container** (`app`): React development server running on `http://localhost:3000`
   - Code location: `src/app/`
   - Uses React Hooks for state management
   - Communicates with Django API via REST endpoints

2. **API Container** (`api`): Django REST API server running on `http://localhost:8000`
   - Code location: `src/rest/`
   - Provides REST endpoints for TODO CRUD operations
   - Connects to MongoDB for data persistence

3. **Mongo Container** (`mongo`): MongoDB database instance running on port `27017`
   - Uses MongoDB 6.0 image
   - Data persisted in `src/db/` directory

## Prerequisites

- Docker and Docker Compose installed
- Git (for cloning the repository)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Assignment
```

### 2. Set Environment Variable

Set the `ADBREW_CODEBASE_PATH` environment variable to point to your project's `src` directory:

```bash
export ADBREW_CODEBASE_PATH="$(pwd)/src"
```

**Note**: Replace `$(pwd)/src` with the absolute path to the `src` directory if needed.

### 3. Build Docker Containers

Build the Docker images (this may take several minutes on first run):

```bash
docker-compose build
```

### 4. Start the Application

Start all containers in detached mode:

```bash
docker-compose up -d
```

### 5. Verify Containers are Running

Check that all containers are up and running:

```bash
docker ps
```

You should see three containers:
- `api` - Django backend
- `app` - React frontend
- `mongo` - MongoDB database

### 6. Access the Application

- **Frontend**: Open [http://localhost:3000](http://localhost:3000) in your browser
- **Backend API**: Access [http://localhost:8000/todos](http://localhost:8000/todos) for the API endpoint

**Note**: The `app` container may take a few minutes to start as it installs all npm dependencies.

## API Endpoints

- `GET /todos` - Retrieve all todos
- `POST /todos` - Create a new todo
- `PUT /todos/<id>` - Update a todo
- `DELETE /todos/<id>` - Delete a todo

## Development

### View Container Logs

View logs for a specific container:

```bash
docker logs -f --tail=100 <container_name>
```

Replace `<container_name>` with `app`, `api`, or `mongo`.

### Access Container Shell

Enter a container to inspect or debug:

```bash
docker exec -it <container_name> bash
```

### Restart a Container

Restart a specific container:

```bash
docker restart <container_name>
```

### Stop All Containers

Stop and remove all containers:

```bash
docker-compose down
```

## Features

- ✅ Create new todos
- ✅ View list of todos
- ✅ Update existing todos
- ✅ Delete todos
- ✅ Real-time UI updates
- ✅ Error handling and user feedback
- ✅ Loading states

## Technology Stack

- **Frontend**: React 17.0.1, React Hooks
- **Backend**: Django 3.0.5, Django REST Framework
- **Database**: MongoDB 6.0
- **Containerization**: Docker, Docker Compose
- **Package Management**: 
  - Python: pip
  - Node.js: yarn

## Important Notes

1. **React Hooks**: All React code uses functional components with hooks (no class components)
2. **MongoDB Only**: The backend uses MongoDB directly via pymongo - no Django models or SQLite
3. **Docker Required**: The application must run in Docker containers
4. **Database Files**: MongoDB data files in `src/db/` are gitignored and should not be committed
5. **Environment Variables**: `.env` files are gitignored for security

## Troubleshooting

### Containers Not Starting

1. Check container logs: `docker logs <container_name>`
2. Verify environment variable is set: `echo $ADBREW_CODEBASE_PATH`
3. Ensure ports 3000, 8000, and 27017 are not in use
4. Try rebuilding: `docker-compose down && docker-compose build && docker-compose up -d`

### Frontend Not Loading

- Wait a few minutes for `yarn install` to complete in the `app` container
- Check `app` container logs for errors
- Verify the container is running: `docker ps`

### Backend API Not Responding

- Check `api` container logs
- Verify MongoDB connection in Django settings
- Ensure `mongo` container is running and healthy

## Code Quality

The codebase follows production-ready standards:
- Error handling and validation
- Modular and maintainable code structure
- Separation of concerns (services, components)
- Clean abstractions
- Comprehensive user feedback

## License

This project is for educational/assignment purposes.
