require('dotenv').config();
const app = require('./app');
const { MongoClient } = require('mongodb');

const PORT = process.env.PORT || 3000;
const uri = process.env.MONGO_URI;

async function startServer() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB');

    // Передаємо клієнт в додаток, якщо потрібно
    app.locals.dbClient = client;

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to DB', err);
    process.exit(1); // Завершити процес, бо без БД далі сенсу немає
  }
}

startServer();
