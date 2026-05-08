# PRIME BACKEND - Scalable REST API with Authentication & Role-Based Access

A full-stack application demonstrating a secure, scalable backend API with user authentication, role-based access control, and a simple frontend UI for testing.

## Features

### Backend
- **User Authentication**: Registration and login with JWT tokens
- **Role-Based Access**: User and Admin roles with different permissions
- **CRUD Operations**: Full Create, Read, Update, Delete for tasks
- **API Versioning**: v1 API endpoints
- **Input Validation**: Server-side validation with express-validator
- **Security**: Password hashing with bcrypt, JWT token handling, CORS, Helmet
- **Documentation**: Swagger/OpenAPI documentation
- **Database**: SQLite database with lightweight schema

### Frontend
- **Simple UI**: Vanilla JavaScript for register, login, and task management
- **JWT Integration**: Secure token storage and API calls
- **Error Handling**: User-friendly error messages
- **Responsive Design**: Basic CSS styling

## Tech Stack

- **Backend**: Node.js, Express.js, SQLite, JWT, bcrypt
- **Frontend**: HTML, CSS, JavaScript
- **Documentation**: Swagger UI
- **Security**: Helmet, CORS, input sanitization

## Database Schema Design

### SQLite Tables

**users**
```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**tasks**
```sql
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- Git

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create or update `.env`:
   ```ini
   PORT=5000
   JWT_SECRET=your_secure_jwt_secret_key
   JWT_EXPIRE=1h
   ADMIN_EMAIL=admin@example.com
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=Admin@123
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Visit Swagger docs:
   ```
   http://localhost:5000/api-docs
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Open `index.html` in a web browser or serve with a local server

## API Documentation

Once the backend is running, visit http://localhost:5000/api-docs for Swagger documentation.

### Key Endpoints

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/tasks` - Get tasks (role-based)
- `POST /api/v1/tasks` - Create task
- `PUT /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task

## Scalability Notes

### Current Architecture
- **Modular Structure**: Separated routes, middleware, and database logic
- **Environment Configuration**: Easy deployment across environments
- **Input Validation**: Prevents malicious data injection

### Scalability Improvements
1. **Microservices**: Split auth and tasks into separate services
2. **Caching**: Implement Redis for frequently accessed data
3. **Load Balancing**: Use Nginx or AWS ELB for multiple instances
4. **Database Optimization**: Add indexes, connection pooling
5. **Monitoring**: Integrate logging with Winston and monitoring tools
6. **Containerization**: Docker for consistent deployment
7. **API Gateway**: For rate limiting and request routing

### Deployment
- **Docker**: Containerize the application
- **Cloud**: Deploy to AWS/GCP/Azure with managed databases
- **CI/CD**: GitHub Actions for automated testing and deployment

## Security Considerations

- JWT tokens with expiration
- Password hashing with bcrypt
- Input sanitization and validation
- CORS configuration
- Helmet for security headers
- Role-based access control

## Testing

- Use the frontend UI to test all features
- Check Swagger docs for API testing
- Test with different user roles

## Future Enhancements

- Email verification for registration
- Password reset functionality
- File upload for tasks
- Real-time notifications with WebSockets
- Unit and integration tests
- API rate limiting