import express from 'express';
import cors from 'cors';
class AppInit {
    private readonly app: express.Application;

    constructor() {
        this.app = express();
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cors())
    }
    get instance() {
        return this.app;
    }
}

export default new AppInit();