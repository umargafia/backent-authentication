# Payment Gateway Backend

A modern TypeScript-based authentication system with MongoDB and Express.

## Features

- User authentication (signup, login, logout)
- Password reset functionality
- JWT-based authentication
- Role-based access control
- Security features (rate limiting, XSS protection, etc.)
- TypeScript support
- MongoDB with Mongoose
- Express.js
- Zod for environment variable validation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a .env file based on .env.example:
   ```bash
   cp .env.example .env
   ```
4. Update the environment variables in .env with your values

## Development

To start the development server:

```bash
npm run dev
```

This will start the server with hot-reload enabled.

## Production

To build and start the production server:

```bash
npm run build
npm start
```

## API Endpoints

### Authentication

- POST /api/v1/users/signup - Register a new user
- POST /api/v1/users/login - Login user
- POST /api/v1/users/forgotPassword - Request password reset
- PATCH /api/v1/users/resetPassword/:token - Reset password

### User Management

- GET /api/v1/users/me - Get current user
- PATCH /api/v1/users/updateMe - Update current user
- DELETE /api/v1/users/deleteMe - Delete current user
- PATCH /api/v1/users/updateMyPassword - Update password

### Admin Routes

- GET /api/v1/users - Get all users
- GET /api/v1/users/:id - Get user by ID
- POST /api/v1/users - Create user
- PATCH /api/v1/users/:id - Update user
- DELETE /api/v1/users/:id - Delete user

## Security Features

- Rate limiting
- XSS protection
- NoSQL query injection protection
- Parameter pollution prevention
- CORS enabled
- Helmet for security headers
- JWT authentication
- Password hashing with bcrypt

## Error Handling

The application includes a global error handling system that handles:
- Validation errors
- JWT errors
- MongoDB errors
- Custom application errors

## TypeScript

The project is written in TypeScript and includes:
- Type definitions for all models
- Type-safe controllers and middleware
- Environment variable validation with Zod
- Custom type declarations for third-party modules

## Testing

To run tests:

```bash
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
