import mongoose from 'mongoose';

/**
 * Establishes a connection to the MongoDB database.
 * 
 * This function uses Mongoose to connect to the MongoDB database. 
 * The URL for the database is retrieved from the environment variable `MONGO_DB_LOCAL_URL`.
 * 
 * @returns {Promise<void>} A promise that resolves when the connection has been established, or rejects if an error occurs.
 */
export async function mongoConnect(): Promise<void> {
    await mongoose.connect(process.env.MONGO_DB_LOCAL_URL);
}

/**
 * Disconnects from the MongoDB database.
 * 
 * This function uses Mongoose to disconnect from the MongoDB database. 
 * 
 * @returns {Promise<void>} A promise that resolves when the connection has been closed, or rejects if an error occurs.
 */
export async function mongoDisconnect(): Promise<void> {
    await mongoose.disconnect();
}

mongoose.connection.once('open', () => {
    console.log('MongoDB connection is ready!');
});

mongoose.connection.on('error', (err) => {
    console.error(err);
});
