import { MongoClient, type MongoClientOptions } from "mongodb"

import { env } from "@/lib/env"

const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient
  mongoClientPromise?: Promise<MongoClient>
}

const mongoClientOptions: MongoClientOptions = {
  connectTimeoutMS: 8000,
  maxPoolSize: 5,
  serverMonitoringMode: "poll",
  serverSelectionTimeoutMS: 8000,
  socketTimeoutMS: 10000,
  waitQueueTimeoutMS: 8000,
}

function getMongoUri() {
  if (!env.MONGODB_URI) {
    throw new Error("Please provide a MONGODB_URI in your environment variables")
  }
  return env.MONGODB_URI
}

export function getMongoClient() {
  if (!globalForMongo.mongoClient) {
    globalForMongo.mongoClient = new MongoClient(getMongoUri(), mongoClientOptions)
  }
  return globalForMongo.mongoClient
}

export async function getConnectedMongoClient() {
  if (!globalForMongo.mongoClientPromise) {
    globalForMongo.mongoClientPromise = getMongoClient().connect()
  }
  return globalForMongo.mongoClientPromise
}

export function getAppDb() {
  return getMongoClient().db()
}
