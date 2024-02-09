import dotenv from 'dotenv';
import http from 'http';
import { app } from './app';
import { mongoConnect } from './services/mongo';

dotenv.config();

const port = process.env.PORT || 3000;
const server = http.createServer(app);

async function startServer(): Promise<void> {
    await mongoConnect();

    server.listen(port, () => {
        console.log(`[server]: Server is running on port: ${port}`);
    });
}

startServer();
