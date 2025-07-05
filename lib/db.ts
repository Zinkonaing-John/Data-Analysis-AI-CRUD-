
import mysql from 'mysql2/promise';
import { ConnectionDetails } from '../components/ConnectionModal';

export const connectToDatabase = async (details: ConnectionDetails & { password?: string }): Promise<mysql.Connection> => {
  try {
    const connection = await mysql.createConnection({
      host: details.host,
      user: details.username,
      password: details.password,
      database: details.dbName,
      port: parseInt(details.port, 10)
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
