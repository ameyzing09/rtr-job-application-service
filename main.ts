import { createServer } from 'http';
import dotenv from 'dotenv';
import App from './lib/appInit';
dotenv.config();

const PORT = process.env.PORT || 3000;

createServer(App.instance).listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

