import mysql from "mysql2/promise";
import { Client as PgClient } from "pg";
import { ConnectionDetails } from "../components/ConnectionModal";

type DbConnection = mysql.Connection | PgClient;

export const connectToDatabase = async (
  details: ConnectionDetails & { password?: string }
): Promise<DbConnection> => {
  try {
    if (details.dbType === "PostgreSQL") {
      const connection = new PgClient({
        host: details.host,
        user: details.username,
        password: details.password,
        database: details.dbName,
        port: parseInt(details.port, 10),
      });
      await connection.connect();
      console.log("PostgreSQL database connected successfully");
      return connection;
    } else {
      // Default to MySQL
      const connection = await mysql.createConnection({
        host: details.host,
        user: details.username,
        password: details.password,
        database: details.dbName,
        port: parseInt(details.port, 10),
      });
      // Test the connection
      await connection.query("SELECT 1");
      console.log("MySQL database connected successfully");
      return connection;
    }
  } catch (error: any) {
    console.error("Database connection failed:", error);
    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      throw new Error(
        "Access denied. Please check your username and password."
      );
    }
    throw error;
  }
};

export const queryDatabase = async (
  connection: DbConnection,
  query: string,
  params: any[] = []
) => {
  try {
    if (connection instanceof PgClient) {
      // PostgreSQL client
      const res = await connection.query(query, params);
      return res.rows;
    } else {
      // MySQL connection
      const [rows] = await (connection as mysql.Connection).execute(
        query,
        params
      );
      return rows;
    }
  } catch (error) {
    console.error("Database query failed:", error);
    throw error;
  }
};

export const disconnectFromDatabase = async (connection: DbConnection) => {
  if (connection) {
    if (connection instanceof PgClient) {
      // PostgreSQL client
      await connection.end();
    } else {
      // MySQL connection
      await (connection as mysql.Connection).end();
    }
    console.log("Database connection closed.");
  }
};
