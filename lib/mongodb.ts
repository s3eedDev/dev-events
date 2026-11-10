import mongoose, { type Connection, type Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable (e.g. in .env.local)",
  );
}

/**
 * Shape of the cached connection state.
 * `conn` holds the resolved Mongoose instance, `promise` holds the in-flight
 * connection attempt so concurrent callers share a single connection.
 */
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

/**
 * Extend the Node.js global type so we can store the cache on `globalThis`.
 * In development, Next.js hot-reloads modules, which would otherwise create a
 * new connection on every reload. `globalThis` survives those reloads.
 */
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = globalThis.mongooseCache ?? {
  conn: null,
  promise: null,
};
globalThis.mongooseCache = cache;

/**
 * Connects to MongoDB (reusing an existing connection when available).
 * Safe to call from any route handler, server component, or server action.
 */
export async function connectToDatabase(): Promise<Mongoose> {
  // Reuse the established connection.
  if (cache.conn) return cache.conn;

  // Start a new connection only if one isn't already in progress.
  if (!cache.promise) {
    cache.promise = mongoose
      .connect(MONGODB_URI as string, {
        bufferCommands: false, // fail fast instead of queueing when disconnected
      })
      .catch((error: unknown) => {
        // Clear the failed promise so the next call can retry.
        cache.promise = null;
        throw error;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}

/** Convenience accessor for the underlying native connection. */
export function getConnection(): Connection {
  return mongoose.connection;
}

export default connectToDatabase;
