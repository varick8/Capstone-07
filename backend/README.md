# Capstone Backend

Backend service for the Capstone air quality monitoring system built with Express.js, TypeScript, and MongoDB.

## Features

- RESTful API for sensor data management
- Air quality index (ISPU) calculations
- JWT-based authentication with refresh tokens
- MongoDB database integration
- CORS configuration for cross-origin requests
- TypeScript for type safety

## Prerequisites

Before running this project, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account or local MongoDB instance

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root of the backend directory by copying the example file:

```bash
cp .env.example .env
```

Then edit the `.env` file with your actual configuration:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/database

# Server Port
PORT=8080

# JWT Secrets (generate secure random strings for production)
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
JWT_EXPIRES_IN=15m

# CORS Origins (comma-separated list of allowed origins)
ALLOWED_ORIGINS=http://localhost:3000,https://your-production-domain.com
```

#### Generating JWT Secrets

For production, generate secure random strings:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. MongoDB Setup

1. Create a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
2. Create a new cluster
3. Add a database user with username and password
4. Whitelist your IP address or use `0.0.0.0/0` for development
5. Get your connection string and update `MONGODB_URI` in `.env`

## Running the Application

### Development Mode

Run the server with hot-reload enabled:

```bash
npm run dev
```

The server will start at `http://localhost:8080` (or the PORT specified in `.env`)

### Production Build

Build the TypeScript code:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Available Scripts

- `npm run dev` - Start development server with hot-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled production build

## API Routes

The backend provides the following API endpoints:

- `GET /` - Health check endpoint
- `/api/sensors` - Sensor data endpoints
- `/api/merge` - Data merging endpoints
- `/api/ispu` - Air quality index endpoints
- `/api/auth` - Authentication endpoints (login, register, refresh token)

## Project Structure

```
backend/
├── src/
│   ├── routes/        # API route handlers
│   ├── models/        # MongoDB models
│   ├── middleware/    # Express middleware
│   └── index.ts       # Application entry point
├── dist/              # Compiled JavaScript (after build)
├── .env               # Environment variables (not in git)
├── .env.example       # Environment variables template
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
└── README.md          # This file
```

## CORS Configuration

The backend is configured to accept requests from origins specified in the `ALLOWED_ORIGINS` environment variable. By default, it allows:

- `http://localhost:3000` (local development)
- Any Vercel deployment URLs (`*.vercel.app`)
- Custom domains specified in `ALLOWED_ORIGINS`

Update the `ALLOWED_ORIGINS` variable in `.env` to add more allowed origins.

## Technologies Used

- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment configuration

## Deployment

This backend is configured for deployment on platforms like:

- **Vercel** (serverless)
- **Heroku**
- **Railway**
- **DigitalOcean**

The application exports the Express app for serverless environments and includes conditional server startup for traditional hosting.

## Troubleshooting

### MongoDB Connection Issues

- Verify your connection string is correct
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure database user credentials are correct

### CORS Errors

- Add your frontend domain to `ALLOWED_ORIGINS` in `.env`
- Make sure the format is comma-separated with no spaces

### Port Already in Use

- Change the `PORT` in `.env` to a different port number
- Kill the process using the port: `lsof -ti:8080 | xargs kill` (Mac/Linux) or `taskkill /F /IM node.exe` (Windows)

## Contributors

Developed by the DTETI UGM Capstone E_07 Project Team.
