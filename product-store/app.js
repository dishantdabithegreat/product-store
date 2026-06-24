// app.js
const path = require('path');
const express = require('express');
const { ObjectId } = require('mongodb');
const { getDb } = require('./db');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const encodeCursor = (createdAt, id) => {
  return Buffer.from(JSON.stringify({ createdAt: createdAt.toISOString(), id })).toString('base64');
};

const decodeCursor = (cursor) => {
  try {
    const value = JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'));
    return {
      createdAt: new Date(value.createdAt),
      id: value.id,
    };
  } catch (err) {
    return null;
  }
};

app.get('/api/products', async (req, res) => {
  try {
    const db = getDb();
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const category = req.query.category;
    const cursor = req.query.cursor;

    const filter = {};
    if (category) {
      filter.category = category;
    }

    if (cursor) {
      const decoded = decodeCursor(cursor);
      if (!decoded || !decoded.createdAt || !decoded.id) {
        return res.status(400).json({ error: 'Invalid cursor value.' });
      }

      filter.$or = [
        { created_at: { $lt: decoded.createdAt } },
        { created_at: decoded.createdAt, _id: { $lt: new ObjectId(decoded.id) } }
      ];
    }

    const cursorQuery = db.collection('products')
      .find(filter)
      .sort({ created_at: -1, _id: -1 })
      .limit(limit + 1);

    const docs = await cursorQuery.toArray();
    const hasMore = docs.length > limit;

    if (hasMore) {
      docs.pop();
    }

    const products = docs.map(doc => ({
      id: doc._id.toString(),
      product_id: doc.product_id,
      name: doc.name,
      category: doc.category,
      price: doc.price,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
    }));

    const nextCursor = hasMore && products.length
      ? encodeCursor(products[products.length - 1].created_at, products[products.length - 1].id)
      : null;

    res.json({
      data: products,
      nextCursor,
      hasMore,
      limit,
      category: category || null,
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Unable to fetch products from database.' });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const db = getDb();
    const categories = await db.collection('products').distinct('category');
    res.json({ categories: categories.sort() });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Unable to fetch categories.' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;