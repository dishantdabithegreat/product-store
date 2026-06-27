# Setup Guide: Product Store

## Prerequisites
- MongoDB Compass installed on your machine.
- Node.js installed.

## Setup Steps

1. **Database Configuration**
   - Setup your MongoDB database and ensure it is accessible via MongoDB Compass.
   - Create a `.env` file in the **root folder** of the project (`product-store`).
   - Add your MongoDB credentials to the `.env` file:
     ```text
     MONGO_URI=your_mongodb_uri_here
     MONGO_DB_NAME=your_database_name_here
     ```

2. **Seed the Database**
   - Navigate to the root folder (`product-store`) in your terminal.
   - Run the following command to seed your data:
     ```bash
     npm run seed
     ```

3. **Start the Server**
   - Once the seeding is complete, run the server from the **root folder**:
     ```bash
     npm start
     ```
