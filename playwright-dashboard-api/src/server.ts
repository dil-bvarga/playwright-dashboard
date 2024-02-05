import dotenv from "dotenv";
import http from "http";
import { app } from "./app";
import { mongoConnect } from "./services/mongo";

dotenv.config();

const port = process.env.PORT || 3000;
const server = http.createServer(app);

async function startServer() {
    await mongoConnect();
    server.listen(port, () => {
        console.log(`[server]: Server is running at http://localhost:${port}`);
    });
}

startServer();
