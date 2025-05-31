const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
app.use(express.json());

const uri = process.env.MONGO_URI; // Ваша змінна середовища з рядком підключення
const client = new MongoClient(uri);
let collection;

async function connectDB() {
  try {
    await client.connect();
    const db = client.db('myDatabase'); // Назва БД
    collection = db.collection('items'); // Назва колекції
    console.log('Connected to MongoDB Atlas');
  } catch (err) {
    console.error('Failed to connect to DB', err);
  }
}

connectDB();

// --- CRUD маршрути ---

// READ з проекцією (query параметр projection як JSON рядок)
app.get('/items', async (req, res) => {
  try {
    const projection = req.query.projection ? JSON.parse(req.query.projection) : {};
    const items = await collection.find({}, { projection }).toArray();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE - insertOne
app.post('/items', async (req, res) => {
  try {
    const result = await collection.insertOne(req.body);
    res.json({ insertedId: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE - insertMany
app.post('/items/bulk', async (req, res) => {
  try {
    if (!Array.isArray(req.body)) return res.status(400).json({ error: 'Expected an array' });
    const result = await collection.insertMany(req.body);
    res.json({ insertedCount: result.insertedCount, insertedIds: result.insertedIds });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE - updateOne (за id, оновлення полів з тіла запиту)
app.patch('/items/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const update = { $set: req.body };
    const result = await collection.updateOne({ _id: new ObjectId(id) }, update);
    res.json({ matchedCount: result.matchedCount, modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE - updateMany (оновлення за фільтром у query, тіла - оновлення)
app.patch('/items', async (req, res) => {
  try {
    const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
    const update = { $set: req.body };
    const result = await collection.updateMany(filter, update);
    res.json({ matchedCount: result.matchedCount, modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE - replaceOne (повна заміна документа за id)
app.put('/items/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await collection.replaceOne({ _id: new ObjectId(id) }, req.body);
    res.json({ matchedCount: result.matchedCount, modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - deleteOne (за id)
app.delete('/items/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    res.json({ deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - deleteMany (за фільтром у query)
app.delete('/items', async (req, res) => {
  try {
    const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
    const result = await collection.deleteMany(filter);
    res.json({ deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
console.log('MONGO_URI:', process.env.MONGO_URI);
