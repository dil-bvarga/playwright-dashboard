import mongoose from "mongoose";

mongoose.connection.once('open', () => {
    console.log('MongoDB connection ready!');
});

mongoose.connection.on('error', (err) => {
    console.error(err);
});

export async function mongoConnect() {
    await mongoose.connect(process.env.MONGO_DB_URL);
}

export async function mongoDisconnect() {
    await mongoose.disconnect();
}