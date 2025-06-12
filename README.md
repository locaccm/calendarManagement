# 📅 Calendar Management API – LocaTech

<!-- Language options -->

<!-- Only English version is maintained -->

The Calendar Management microservice is part of the LocaTech project.  
It is responsible for managing events and reservations by providing endpoints to create, read, update, and delete events, as well as specialized calendar views (day, week, month).

This service is built in TypeScript using Express, secured by access rights from an Access API, and tested with Jest/Supertest. It is containerized with Docker and deployable on Google Cloud Run.

## 🚀 Features

- 📆 **Complete Event Management**: Create, read, update, and delete
- 📊 **Calendar Views**: Display by day, week, or month
- 🔄 **Multi-event Support**: Multiple events can be scheduled in the same time slot
- 📱 **Frontend-friendly Format**: Separated date/time fields for easy integration
- 🔍 **Advanced Filtering**: Search for events by user, accommodation, date, etc.
- 📚 **Swagger Documentation**: API documentation available at `/api-docs`
- ✅ **Integration Tests**: With Jest and Supertest
- 🎯 **Linting & Formatting**: Via ESLint and Prettier
- 🐳 **Dockerized**: Ready for deployment on Google Cloud Run

## Table of Contents

- [Installation](#-installation)
- [Configuration](#%EF%B8%8F-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Calendar Views](#-calendar-views)
- [Event Format](#-event-format)
- [Testing](#-testing)
- [Security](#-security)
- [Docker](#-docker)

## 🔧 Installation

### Prerequisites

- Node.js (v20 recommended)
- PostgreSQL
- Google Cloud Platform account (for deployment)
- Docker (optional for containerization)

### Steps

```bash
git clone https://github.com/locaccm/calendarManagement.git
cd calendarManagement
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Apply DB migrations
npx prisma migrate dev

# Start the development server
npm run dev
```

## ⚙️ Configuration

The application uses a single `.env` file for all environments. The environment mode is controlled by the `NODE_ENV` variable:

Create a `.env` file at the root of the project and configure the following:

```env
# Database configuration
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# Environment configuration
NODE_ENV="production" # or "development"
PORT=3000

# CORS configuration
CORS_ORIGIN="*"
ACCESS_API_URL=https://access-api-url.com/access/check

# Swagger configuration (development only)
API_VERSION="1.0.0"
API_TITLE="Calendar Management API"
```

### Environment Variables

| Variable       | Description                                        |
| -------------- | -------------------------------------------------- |
| DATABASE_URL   | Your PostgreSQL connection string                  |
| NODE_ENV       | Environment mode ("production" or "development")   |
| PORT           | Port the server listens on (default: 3000)         |
| CORS_ORIGIN    | CORS configuration for allowed origins             |
| ACCESS_API_URL | URL of the Access API for rights verification      |
| API_VERSION    | API version for Swagger documentation (dev only)   |
| API_TITLE      | API title for Swagger documentation (dev only)     |

## 📋 Usage

### API Endpoints

| Method | Endpoint                    | Description                                |
| ------ | --------------------------- | ------------------------------------------ |
| GET    | `/events`                   | List all events                            |
| GET    | `/events/:id`               | Get an event by ID                         |
| POST   | `/events`                   | Create a new event                         |
| PUT    | `/events/:id`               | Update an event                            |
| DELETE | `/events/:id`               | Delete an event                            |
| GET    | `/events/filter`            | Filter events by criteria                  |
| GET    | `/calendar/day`             | Calendar view by day                       |
| GET    | `/calendar/week`            | Calendar view by week                      |
| GET    | `/calendar/month`           | Calendar view by month                     |

Authentication and authorization are managed through an Access API.
Each route is protected by access rights like `getEvents`, `createEvent`, etc., which are verified by calling the Access API URL specified in the environment variables.

## 📚 API Documentation

Swagger documentation is available only in development mode. Once the server is running with `npm run dev`, access Swagger at:

```text
http://localhost:3000/api-docs
```

This provides a complete overview of all endpoints, parameters, and request/response examples.

## 📅 Calendar Views

The API offers several views to facilitate displaying events:

### Day View

```http
GET /calendar/day?date=YYYY-MM-DD
```

Returns events for a specific day with the following structure:

```json
{
  "date": "2025-05-15",
  "events": [...]
}
```

### Week View

```http
GET /calendar/week?week=20&year=2025
```

or

```http
GET /calendar/week?date=2025-05-15
```

Returns events for a specific week with useful metadata:

```json
{
  "week": 20,
  "year": 2025,
  "startDate": "2025-05-11",
  "endDate": "2025-05-17",
  "days": ["2025-05-11", "2025-05-12", ...],
  "events": [...]
}
```

### Month View

```http
GET /calendar/month?month=5&year=2025
```

or

```http
GET /calendar/month?date=2025-05-15
```

Returns events for a specific month with useful metadata:

```json
{
  "month": 5,
  "year": 2025,
  "startDate": "2025-05-01",
  "endDate": "2025-05-31",
  "daysInMonth": 31,
  "days": ["2025-05-01", "2025-05-02", ...],
  "events": [...]
}
```

## 📝 Event Format

Events can be created with different date/time formats:

### ISO Format

```json
{
  "EVEC_LIB": "Important Meeting",
  "EVED_START": "2025-06-01T09:00:00Z",
  "EVED_END": "2025-06-01T11:00:00Z",
  "USEN_ID": 1,
  "ACCN_ID": 1
}
```

### Split Format

```json
{
  "EVEC_LIB": "Important Meeting",
  "DATE_START": "2025-06-01",
  "START_TIME": "09:00",
  "DATE_END": "2025-06-01",
  "END_TIME": "11:00",
  "USEN_ID": 1,
  "ACCN_ID": 1
}
```

### Enriched Response

Returned events include the following fields to facilitate frontend integration:

```json
{
  "EVEN_ID": 1,
  "EVEC_LIB": "Important Meeting",
  "EVED_START": "2025-06-01T09:00:00Z",
  "EVED_END": "2025-06-01T11:00:00Z",
  "USEN_ID": 1,
  "ACCN_ID": 1,
  "startDate": "2025-06-01",
  "startTime": "09:00",
  "endDate": "2025-06-01",
  "endTime": "11:00"
}
```

## 🧪 Testing

```bash
# Run all tests with coverage
npm test

# ESLint test
npm run lint

# Prettier test
npm run prettier
```

## 🔒 Security

The API uses several security mechanisms:

- **Access API Integration**: Authentication and authorization via a centralized Access API
- **CORS**: Basic CORS configuration as specified in environment variables
- **Input Validation**: Strict verification of received data
- **Error Handling**: Secure error messages without disclosure of sensitive information

### Access API Integration

#### Overview

The Calendar Management API uses a robust authorization system that delegates access control to a centralized Access API. This approach follows the separation of concerns principle, allowing the Calendar API to focus on its core functionality while the Access API handles all authorization decisions.

#### How It Works

1. **Authorization Flow**:
   - When a request is made to a protected endpoint, the `authorizeWithApi` middleware intercepts it
   - The middleware extracts the access token from either:
     - The `Authorization` header (format: `Bearer <token>`)
     - The `X-Access-Token` header (alternative method)
   - The middleware then calls the Access API with the token and the required right name
   - The Access API validates the token and checks if the user has the required right
   - Based on the Access API response, the request is either allowed to proceed or rejected

2. **Right-Based Authorization**:
   - Each endpoint is protected by a specific right name (e.g., `createEvent`, `getEvents`, `updateEvent`)
   - The right name is passed to the Access API along with the token
   - This allows for fine-grained access control at the endpoint level

3. **Configuration**:
   - The Access API URL is configured via the `ACCESS_API_URL` environment variable
   - Default fallback URL: `http://localhost:4000/access/check`
   - Each middleware can optionally override the API URL if needed

4. **Error Handling**:
   - 401 Unauthorized: Returned when no token is provided
   - 403 Forbidden: Returned when the Access API denies access
   - 500 Internal Server Error: Returned when there's an issue communicating with the Access API

## 🐳 Docker

The Calendar Management API is fully containerized for easy deployment and consistent environments across development and production.

### Prerequisites

- Docker installed on your machine
- PostgreSQL instance accessible from the container (can be another container or external database)

### Building the Docker Image

```bash
# Build the Docker image
docker build -t calendar-management-api .
```

### Running the Container

```bash
# Run the container with environment variables
docker run -d --name calendar-api \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@host:5432/calendar_management?schema=public" \
  -e NODE_ENV=production \
  -e ACCESS_API_URL="http://your-access-api-url/access/check" \
  calendar-management-api
```

### Environment Variables

When running the Docker container, you can override the default environment variables:

| Variable       | Default Value                           | Description                                  |
| -------------- | --------------------------------------- | -------------------------------------------- |
| NODE_ENV       | "production"                            | Environment mode                             |
| PORT           | "3000"                                  | Port the server listens on                   |
| CORS_ORIGIN    | "*"                                     | CORS configuration                           |
| ACCESS_API_URL | "http://localhost:4000/access/check"    | URL of the Access API for rights verification|
| API_VERSION    | "1.0.0"                                 | API version for Swagger documentation         |
| API_TITLE      | "Calendar Management API"               | API title for Swagger documentation           |

### Health Check

The Docker container includes a health check that verifies the application is running correctly:

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1
```

### Docker Image Structure

The Docker image uses a multi-stage build process to create a smaller, more secure production image:

1. **Builder stage**: Installs all dependencies, generates Prisma client, and builds the TypeScript code
2. **Production stage**: Includes only production dependencies and the built application

This approach results in a smaller image size and reduced attack surface.

## 👤 Author

Dynastie AMOUSSOU
LocaTech CCM Master's Project

Test file location :

All test files must be located in src/tests/ and follow the .test.ts naming convention. Only these files will be included in test execution and coverage reports.

Don't forget to delete a.test.ts