const express = require('express');

module.exports = (collection) => {
  const router = express.Router();

  // 1. Читання з проекцією (query параметр projection - поля через кому)
  router.get('/', async (req, res) => {
    try {
      const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
      const projection = {};
      if (req.query.projection) {
        req.query.projection.split(',').forEach(field => {
          projection[field.trim()] = 1;
        });
      }
      const data = await collection.find(filter, { projection }).toArray();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2. Insert One
  router.post('/insertOne', async (req, res) => {
    try {
      const doc = req.body;
      const result = await collection.insertOne(doc);
      res.json({ insertedId: result.insertedId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Insert Many
  router.post('/insertMany', async (req, res) => {
    try {
      const docs = req.body; // очікуємо масив документів
      if (!Array.isArray(docs)) {
        return res.status(400).json({ error: 'Body must be an array of documents' });
      }
      const result = await collection.insertMany(docs);
      res.json({ insertedCount: result.insertedCount, insertedIds: result.insertedIds });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Update One (пошук за _id або іншим фільтром, оновлення $set)
  router.patch('/updateOne/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const update = { $set: req.body };
      const result = await collection.updateOne({ _id: new ObjectId(id) }, update);
      res.json({ matchedCount: result.matchedCount, modifiedCount: result.modifiedCount });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Update Many (за фільтром у тілі, оновлення $set)
  router.patch('/updateMany', async (req, res) => {
    try {
      const { filter, update } = req.body;
      if (!filter || !update) {
        return res.status(400).json({ error: 'Filter and update fields are required' });
      }
      const result = await collection.updateMany(filter, { $set: update });
      res.json({ matchedCount: result.matchedCount, modifiedCount: result.modifiedCount });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. Replace One (заміна цілого документа за _id)
  router.put('/replaceOne/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const newDoc = req.body;
      const result = await collection.replaceOne({ _id: new ObjectId(id) }, newDoc);
      res.json({ matchedCount: result.matchedCount, modifiedCount: result.modifiedCount });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 7. Delete One за _id
  router.delete('/deleteOne/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      res.json({ deletedCount: result.deletedCount });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 8. Delete Many за фільтром у тілі
  router.delete('/deleteMany', async (req, res) => {
    try {
      const filter = req.body;
      const result = await collection.deleteMany(filter);
      res.json({ deletedCount: result.deletedCount });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
