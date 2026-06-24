// server.js
const app = require('./app');
const { connectToDb } = require('./db');

const PORT = 3000;

// Start server only after DB is connected
connectToDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });