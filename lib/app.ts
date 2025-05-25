import express from 'express';
import cors from 'cors';
class App {
    private app!: express.Express;

    async initialiseBackendServer() {
        this.app = express();
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cors())
    }
}

export default new App();