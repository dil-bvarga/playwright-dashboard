import express, { Express, Request, Response } from "express";
import cors from "cors";

export const app: Express = express();

app.use(cors({
    origin: 'http://localhost:4200'
}));
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({});
});
