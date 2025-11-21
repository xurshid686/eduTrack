import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-tracker';

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db();
  cachedDb = db;
  return db;
}

export default async function handler(req, res) {
  const token = cookie.parse(req.headers.cookie || '').token;

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.profile !== 'teacher') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const db = await connectToDatabase();

    if (req.method === 'GET') {
      const students = await db.collection('students').find({}).toArray();
      return res.status(200).json({ students });
    }

    if (req.method === 'POST') {
      const { name, email, grade, parentEmail } = req.body;
      
      const student = {
        name,
        email,
        grade,
        parentEmail,
        progress: 0,
        status: 'active',
        createdAt: new Date(),
        lastActivity: null
      };

      const result = await db.collection('students').insertOne(student);
      return res.status(201).json({ success: true, studentId: result.insertedId });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Students API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
