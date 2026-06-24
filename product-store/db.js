require('dotenv').config(); // Load variables
// db.js
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME;

if (!uri) {
  throw new Error('MONGO_URI is not defined in .env');
}

const client = new MongoClient(uri);
let dbConnection;

module.exports = {
  connectToDb: async () => {
    if (dbConnection) {
      return dbConnection;
    }

    const connectedClient = await client.connect();
    dbConnection = dbName ? connectedClient.db(dbName) : connectedClient.db();
    return dbConnection;
  },
  getDb: () => {
    if (!dbConnection) {
      throw new Error('Database not connected yet. Call connectToDb() first.');
    }
    return dbConnection;
  }
};