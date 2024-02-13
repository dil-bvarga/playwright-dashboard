import dotenv from 'dotenv';
import http from 'http';
import { app } from './app';
import { connectToDatabase } from './services/mongo-db-service';

dotenv.config();

const port = process.env.PORT || 3000;
const server = http.createServer(app);

async function startServer(): Promise<void> {
    await connectToDatabase(process.env.MONGO_DB_LOCAL_URL);

    server.listen(port, () => {
        console.log(`[server]: Server is running on port: ${port}`);
    });
}

startServer();
