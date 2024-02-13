import mongoose from 'mongoose';

/**
 * Connects to a MongoDB database using Mongoose.
 *
 * This function uses Mongoose to establish a connection to a MongoDB database. The URL of the database is passed as a parameter.
 *
 * @param {string} databaseUrl - The URL of the MongoDB database to connect to.
 * @returns {Promise<void>} A promise that resolves when the connection is established.
 */
export async function connectToDatabase(databaseUrl: string): Promise<void> {
    await mongoose.connect(databaseUrl);
}

/**
 * Disconnects from the MongoDB database.
 * 
 * This function uses Mongoose to disconnect from the MongoDB database. 
 * 
 * @returns {Promise<void>} A promise that resolves when the connection has been closed, or rejects if an error occurs.
 */
export async function disconnectDatabase(): Promise<void> {
    await mongoose.disconnect();
}

/**
 * Sets up event listeners for the Mongoose connection.
 *
 * The 'open' event is emitted when the MongoDB database connection is ready. 
 * When this event is emitted, a message is logged to the console.
 *
 * The 'error' event is emitted when an error occurs with the MongoDB database connection. 
 * When this event is emitted, the error is logged to the console.
 */
mongoose.connection.once('open', () => {
    console.log('MongoDB connection is ready!');
});

mongoose.connection.on('error', (err) => {
    console.error(err);
});
