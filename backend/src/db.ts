import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config(); // load environment variables from .env file

// create a connection to the database
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'login_register_crud_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

const testConnection = async (): Promise<void> => {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to the database');
        connection.release();
    } catch (error) {
        console.error('Error connecting to the database:', error);
        process.exit(1);
    };
}

testConnection();

export default pool;