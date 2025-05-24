import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

// add logger later in npm private library

dotenv.config();

const getDBConfig =async  () => {
    if(
        process.env.DB_HOST &&
        process.env.CONFIG &&
        process.env.DB_USER &&
        process.env.DB_PASSWORD
    ) {
        return {
            DB_HOST: process.env.DB_HOST,
            DB_USER: process.env.DB_USER,
            DB_PASSWORD: process.env.DB_PASSWORD,
            DB_NAME: process.env.DB_NAME,
            DB_CONFIG: process.env.CONFIG,
        }
    }
    return;
}

const dbConfig = await getDBConfig();

const additionalConfig = JSON.parse(dbConfig?.DB_CONFIG || '{}');
const sequelize = new Sequelize(
    dbConfig?.DB_NAME || '',
    dbConfig?.DB_USER || '',
    dbConfig?.DB_PASSWORD || '',
    {
        host: additionalConfig?.DB_HOST || dbConfig?.DB_HOST || '',
        dialect: additionalConfig?.DB_DIALECT || 'mysql',
        pool: {
            max: additionalConfig?.DB_POOL_MAX || 5,
            min: additionalConfig?.DB_POOL_MIN || 0,
        },
        define: {
            freezeTableName: true,
        },
        logging: false
    }
);

try {
    await sequelize.authenticate();
} catch (error) {
    console.error('Unable to connect to the database:', error);
}

export default sequelize;