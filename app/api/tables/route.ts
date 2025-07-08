import { NextRequest, NextResponse } from "next/server";
import {
  connectToDatabase,
  queryDatabase,
  disconnectFromDatabase,
} from "../../../lib/db";

export async function POST(req: NextRequest) {
  let connection;
  let connectionDetails: any; // Declare connectionDetails here

  try {
    if (process.env.NODE_ENV === 'production') {
      // In production, try to connect using environment variables (Supabase)
      connection = await connectToDatabase();
      // For production, assume PostgreSQL if connected via env vars
      connectionDetails = { dbType: "PostgreSQL" };
    } else {
      // In development, use connection details from the request body
      const body = await req.json();
      connectionDetails = body.connectionDetails;
      connection = await connectToDatabase(connectionDetails);
    }

    // Use different queries for MySQL and PostgreSQL
    let tables;
    if (connectionDetails.dbType === "PostgreSQL") {
      tables = await queryDatabase(
        connection,
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
      );
      const tableNames = (tables as any[]).map((table) => table.table_name);
      return NextResponse.json(tableNames);
    } else {
      // MySQL
      tables = await queryDatabase(connection, "SHOW TABLES");
      console.log("MySQL tables result:", tables);

      if (!tables || !Array.isArray(tables)) {
        console.error("Invalid tables result:", tables);
        throw new Error("Failed to fetch tables from database");
      }

      // Handle different possible formats of SHOW TABLES result
      const tableNames = (tables as any[]).map((table) => {
        // The result might have different column names depending on MySQL version
        if (table.Tables_in_database) {
          return table.Tables_in_database;
        } else if (table[`Tables_in_${connectionDetails.dbName}`]) {
          return table[`Tables_in_${connectionDetails.dbName}`];
        } else {
          // Fallback to first value
          return Object.values(table)[0];
        }
      });

      console.log("Extracted table names:", tableNames);
      return NextResponse.json(tableNames);
    }
  } catch (error) {
    console.error("Error fetching tables:", error);
    return new NextResponse(
      JSON.stringify({ message: (error as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    if (connection) {
      await disconnectFromDatabase(connection);
    }
  }
}
