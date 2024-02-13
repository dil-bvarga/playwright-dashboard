import dotenv from 'dotenv';
import http from 'http';
import { app } from './app';
import { MongoDBService } from './services/mongo-db-service';
import { Database } from './interfaces/database';

dotenv.config();

const port = process.env.PORT || 3000;
const server = http.createServer(app);
const database: Database = new MongoDBService();

async function startServer(): Promise<void> {
    await database.connect(process.env.DATABASE_URL);

    server.listen(port, () => {
        console.log(`[server]: Server is running on port: ${port}`);
    });
}

startServer();
