<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## 🚀 Overview

Integration with third party TMDB Apis for listing, storing data into MongoDB database.

### Key Features

- 📱 **Platform API** - Separate endpoints mobile platform
- ⚡ **Redis Caching** - High-performance caching for improved response times
- 🔒 **Security** - Api key Passport Strategy
- 📄 **API Documentation** - Complete Swagger/OpenAPI documentation

## 🏗️ System Architecture

### Technology Stack

- **Backend Framework**: NestJS 10.x with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis with cache manager module
- **Authentication**: Api Key passport strategy
- **API Documentation**: Swagger/OpenAPI
- **Validation**: class-validator with custom decorators
- **Testing**: Jest with comprehensive test coverage

### Architecture Patterns

- **Modular Architecture** - Feature-based module organization
- **Repository Pattern** - Data access abstraction layer
- **Factory Pattern** - Service selection based on environment
- **Transformer Pattern** - Data transformation and serialization
- **Guard Pattern** - Authentication
- **Decorator Pattern** - Metadata and validation

## 🐳 Docker Development Setup

You can quickly run the entire application stack using Docker Compose. This includes MongoDB, Redis, and the NestJS application with hot-reload for development.

### Quick Start

1. Make sure Docker and Docker Compose are installed on your machine
2. Run the setup script to create the environment file:
   ```bash
   ./setup-env.sh
   ```
3. Start the containers:
   ```bash
   docker-compose up -d
   ```
4. The application will be available at http://localhost:8080

For more detailed instructions, see the [Docker Setup Guide](./DOCKER_SETUP.md).

## 📊 Database Schema

### Core Entities

#### Movie
```MongoDB
Movie {
  id: Number (PK)
  backdrop_path: String
  genre_ids: Number[]
  original_language: String
  original_title: String
  overview: String
  popularity: Number
  poster_path: String
  release_date: String
  title: String
  video: Boolean
  vote_average: Number
  vote_count: number
}
```

## 🔌 API Endpoints

### Movies Endpoints
```
GET    /api/v1/movie                   # Find All Movies
GET    /api/v1/movie/:id               # Find One Movie
POST   /api/v1/movie/addToFavorite     # Add Movie To Favorite
POST   /api/v1/movie/addToWatch        # Add Movie To Watch
GET    /api/v1/movie/favorite          # Find All Favorite Movies
GET    /api/v1/movie/watch             # Find All Watch Movies
POST   /api/v1/movie/makeRate          # Make Rate Movie
POST   /api/v1/movie                   # Create Movie
```

## 🔧 Configuration System

The application uses a comprehensive configuration system with environment-based settings:

### Core Configuration
```bash
# App
NODE_ENV="local"
SERVER_PORT="8080"
API_KEY="a1aa3908fab694fb3db28835664193d9"

# Database
MONGO_HOST="localhost"
MONGO_PORT="27017"
MONGO_USERNAME=""
MONGO_PASSWORD=""
MONGO_DATABASE="movie_service"
MONGO_DATABASE_AUTH="admin"
MONGO_DNS_SERVE="mongodb://"

# Services
MOVIE_BASE_URL="https://api.themoviedb.org"
MOVIE_API_KEY="fa05d8752e51d0240ca34c53bc8e2194"
MOVIE_ACCESS_TOKEN_V3="eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmYTA1ZDg3NTJlNTFkMDI0MGNhMzRjNTNiYzhlMjE5NCIsIm5iZiI6MTc2MTQ4Mzk4NC41NTQsInN1YiI6IjY4ZmUxY2QwZTk0ZDNjYTUwOWZiNmUyZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.-fztVO1jeHAW2l3m1OsIwAnLtJHKKbABWEUfp5Ed7EQ"
MOVIE_SESSION_ID="8b4ebc30e303562c47a9e2a4d10c3976"
MOVIE_ACCOUNT_ID="22414830"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6380"
REDIS_USERNAME=""
REDIS_PASSWORD=""

# Jest
COVERAGE="false"
COVERAGE_THRESHOLD_FUNCTIONS="10"
COVERAGE_THRESHOLD_LINES="10"
COVERAGE_THRESHOLD_STATEMENTS="10"
COVERAGE_THRESHOLD_BRANCHES="10"
```

## 🚀 Getting Started

### Prerequisites

- Node.js 22.x or higher
- MONGO database
- Redis (optional, for caching)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd movie-service
```

2. **Install dependencies**
```bash
yarn install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Set up the database**
```bash
Step 1: Connect to Mongo
mongo
#(or if you're using the new shell)
mongosh
# Step 2: Create / Switch to the database
use movie_service
# MongoDB will create the database automatically once you insert data or create a collection.
# Example: Create a collection inside it
db.test.insertOne({ title: "Inception", year: 2010 })
# Now the database officially exists 🎉
```

5. **Start the application**
```bash
# Development mode
yarn start:dev

# Production mode
yarn build
yarn start:prod
```

## Development Commands

```bash
# Development
yarn start:dev          # Start with hot reload
yarn start:debug        # Start with debugging

# Building
yarn build              # Build for production
yarn start:prod         # Start production build

# Testing
yarn test               # Run unit tests
yarn test:e2e           # Run end-to-end tests
yarn test:cov           # Run tests with coverage
```

## 🧪 Testing Strategy

### Test Coverage
- **Unit Tests** for services and controllers
- **Integration Tests** for API endpoints
- **E2E Tests** for complete workflows
- **Mock Services** for external dependencies

### Testing Commands
```bash
yarn test                # Unit tests
yarn test:watch          # Watch mode
yarn test:cov            # Coverage report
yarn test:e2e            # End-to-end tests
yarn test:debug          # Debug mode
```

### Environment Variables
Ensure all required environment variables are set:
- Database connection string
- API KEY Passport Strategy key
- External third party TMDB keys
- Redis connection details

### Docker Deployment
```dockerfile
# Example Dockerfile
# Use Node.js base image
FROM node:20-alpine
# Set working directory
WORKDIR /usr/src/app
# Install dependencies first (better caching)
COPY package*.json yarn.lock* ./ 
RUN yarn install --frozen-lockfile
# Copy source code
COPY . .
# Build the app
RUN yarn build
# Expose the app port (NestJS default is 8080)
EXPOSE 8080
# Run the app
CMD ["yarn", "start:prod"]
```

### Docker Compose Deployment
```dockerComposeFile
# Example DockerComposeFile

version: "3.9"

services:
  app:
    build: .
    container_name: nestjs-app
    restart: always
    ports:
      - "8080:8080"
    depends_on:
      - redis
    environment:
      NODE_ENV: development
      REDIS_HOST: redis
      REDIS_PORT: 6381

  redis:
    image: redis:7-alpine
    container_name: redis-cache
    restart: always
    ports:
      - "6381:6379"
    volumes:
      - redis-data:/data

volumes:
  redis-data:
  
```

## 📚 API Documentation

### Swagger UI
Access the interactive API documentation at:
- **Development**: `http://localhost:8080/docs`
- **Production**: `https://your-domain.com/docs`

### Health Endpoints
Monitor application health:
- **Health Check**: `GET /api/v1/health`

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Standards
- **TypeScript** with strict mode enabled
- **ESLint** and **Prettier** for code formatting
- **Conventional Commits** for commit messages
- **Jest** for testing with high coverage
- **Mongoose** for database operations


## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).

<p align="center">
  Built with ❤️ using <a href="https://nestjs.com/">NestJS</a>
</p>