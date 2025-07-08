import mysql from "mysql2/promise";
import { Client as PgClient } from "pg";
import { ConnectionDetails } from "../components/ConnectionModal";

type DbConnection = mysql.Connection | PgClient;

export const connectToDatabase = async (
  details?: ConnectionDetails & { password?: string } // Make details optional
): Promise<DbConnection> => {
  try {
    let connectionDetailsToUse: ConnectionDetails & { password?: string };

    if (details) {
      // If details are provided (from UI), use them
      connectionDetailsToUse = details;
    } else {
      // If no details provided, attempt to use environment variables for PostgreSQL (Supabase)
      // Ensure these environment variables are set in your deployment environment
      if (!process.env.SUPABASE_DB_HOST || !process.env.SUPABASE_DB_USER || !process.env.SUPABASE_DB_PASSWORD || !process.env.SUPABASE_DB_NAME) {
        console.warn("Supabase environment variables are not fully set. Falling back to UI input if available.");
        throw new Error("Supabase environment variables are not set for default connection.");
      }
      connectionDetailsToUse = {
        dbType: "PostgreSQL", // Supabase is PostgreSQL
        host: process.env.SUPABASE_DB_HOST,
        port: process.env.SUPABASE_DB_PORT || '5432', // Default PostgreSQL port
        username: process.env.SUPABASE_DB_USER,
        password: process.env.SUPABASE_DB_PASSWORD,
        dbName: process.env.SUPABASE_DB_NAME,
      };
      console.log("Attempting to connect using Supabase environment variables.");
    }

    if (connectionDetailsToUse.dbType === "PostgreSQL") {
      const connection = new PgClient({
        host: connectionDetailsToUse.host,
        user: connectionDetailsToUse.username,
        password: connectionDetailsToUse.password,
        database: connectionDetailsToUse.dbName,
        port: parseInt(connectionDetailsToUse.port, 10),
      });
      await connection.connect();
      console.log("PostgreSQL database connected successfully");
      return connection;
    } else if (connectionDetailsToUse.dbType === "MySQL") {
      const connection = await mysql.createConnection({
        host: connectionDetailsToUse.host,
        user: connectionDetailsToUse.username,
        password: connectionDetailsToUse.password,
        database: connectionDetailsToUse.dbName,
        port: parseInt(connectionDetailsToUse.port, 10),
      });
      await connection.query("SELECT 1");
      console.log("MySQL database connected successfully");
      return connection;
    } else {
      throw new Error(`Unsupported database type: ${connectionDetailsToUse.dbType}`);
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
