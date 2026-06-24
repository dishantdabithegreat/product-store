require('dotenv').config();
const { MongoClient } = require('mongodb');
const { faker } = require('@faker-js/faker');

const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'ecommerce-db';
const TOTAL_PRODUCTS = 200000;
const BATCH_SIZE = 5000;

if (!MONGO_URI) {
  throw new Error('MONGO_URI is not defined in .env');
}

async function seedDatabase() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(MONGO_DB_NAME);
    const collection = db.collection('products');

    await collection.deleteMany({});
    console.log('Database cleared. Starting ingestion...');

    const categories = ['Electronics', 'Home', 'Books', 'Clothing', 'Sports'];

    for (let i = 0; i < TOTAL_PRODUCTS / BATCH_SIZE; i++) {
      const batch = Array.from({ length: BATCH_SIZE }, () => ({
        product_id: faker.string.uuid(),
        name: faker.commerce.productName(),
        category: faker.helpers.arrayElement(categories),
        price: parseFloat(faker.commerce.price()),
        created_at: new Date(),
        updated_at: new Date(),
      }));

      await collection.insertMany(batch);
      console.log(`Progress: ${(i + 1) * BATCH_SIZE} / ${TOTAL_PRODUCTS}`);
    }

    await collection.createIndexes([
      { key: { category: 1 } },
      { key: { price: 1 } }
    ]);
    console.log('Seeding complete. Indexes created.');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seedDatabase();