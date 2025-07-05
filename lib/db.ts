
import mysql from 'mysql2/promise';
import { ConnectionDetails } from '../components/ConnectionModal';

export const connectToDatabase = async (): Promise<mysql.Connection> => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      port: parseInt(process.env.DB_PORT || '3306', 10)
    });
    // Test the connection
    await connection.query('SELECT 1');
    console.log('Database connected successfully');
    return connection;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

export const queryDatabase = async (connection: mysql.Connection, query: string, params: any[] = []) => {
  try {
    const [rows] = await connection.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Database query failed:', error);
    throw error;
  }
};

export const disconnectFromDatabase = async (connection: mysql.Connection) => {
  if (connection) {
    await connection.end();
    console.log('Database connection closed.');
  }
};
