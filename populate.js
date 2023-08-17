import dotenv from 'dotenv';
dotenv.config();
import connectDB from './db/connect.js';
import Job from './models/Job.js';
import mockData from './mock-data.json' assert { type: 'json' };

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    await Job.deleteMany();
    await Job.create(mockData);
    console.log('Success Adding Data!');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();
