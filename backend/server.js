const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
require('./db'); // Initialize SQLite database
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve Frontend Static Files
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/tasks', require('./routes/tasks'));

// Catch-all route to serve the frontend for any unhandled routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// API 404 (only hits if the route starts with /api but isn't found, though the catch-all above will intercept it. To be clean, we let frontend handle 404s).

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});