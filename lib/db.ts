import mongoose from 'mongoose';

declare global {
  // eslint-disable-next-line no-var
  var mongoose:
    | {
        conn: typeof import('mongoose') | null;
        promise: Promise<typeof import('mongoose')> | null;
      }
    | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/duka-smart';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const cached: {
  conn: typeof import('mongoose') | null;
  promise: Promise<typeof import('mongoose')> | null;
} = global.mongoose || { conn: null, promise: null };

global.mongoose = cached;

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
