import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password, profile } = req.body;

  try {
    const db = await connectToDatabase();
    
    // For demo purposes - in production, you should have proper user registration
    if (username === 'teacher' && password === 'teacher123') {
      const token = jwt.sign(
        { 
          username: 'teacher', 
          profile: 'teacher',
          name: 'John Doe'
        }, 
        JWT_SECRET, 
        { expiresIn: '7d' }
      );

      res.setHeader('Set-Cookie', cookie.serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 604800, // 1 week
        path: '/',
      }));

      return res.status(200).json({ 
        success: true, 
        profile: 'teacher',
        name: 'John Doe'
      });
    }

    if (username === 'student' && password === 'student123') {
      const token = jwt.sign(
        { 
          username: 'student', 
          profile: 'student',
          name: 'Emma Johnson',
          studentId: 'S001'
        }, 
        JWT_SECRET, 
        { expiresIn: '7d' }
      );

      res.setHeader('Set-Cookie', cookie.serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 604800,
        path: '/',
      }));

      return res.status(200).json({ 
        success: true, 
        profile: 'student',
        name: 'Emma Johnson'
      });
    }

    // Check database for users
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ 
      username, 
      profile 
    });

    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { 
          username: user.username, 
          profile: user.profile,
          name: user.name,
          ...(user.profile === 'student' && { studentId: user.studentId })
        }, 
        JWT_SECRET, 
        { expiresIn: '7d' }
      );

      res.setHeader('Set-Cookie', cookie.serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 604800,
        path: '/',
      }));

      return res.status(200).json({ 
        success: true, 
        profile: user.profile,
        name: user.name
      });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
