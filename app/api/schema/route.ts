import { NextRequest, NextResponse } from "next/server";
import {
  connectToDatabase,
  queryDatabase,
  disconnectFromDatabase,
} from "../../../lib/db";

export async function POST(req: NextRequest) {
  let connection;
  let connectionDetails: any; // Declare connectionDetails here
  let tableName: string;

  try {
    if (process.env.NODE_ENV === 'production') {
      // In production, try to connect using environment variables (Supabase)
      connection = await connectToDatabase();
      // For production, assume PostgreSQL if connected via env vars
      connectionDetails = { dbType: "PostgreSQL" };
      const body = await req.json();
      tableName = body.tableName;
    } else {
      // In development, use connection details from the request body
      const body = await req.json();
      tableName = body.tableName;
      connectionDetails = body.connectionDetails;
      connection = await connectToDatabase(connectionDetails);
    }

    if (!tableName) {
      return new NextResponse(
        JSON.stringify({ message: "Table name is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let columns, primaryKey;

    if (connectionDetails.dbType === "PostgreSQL") {
      // PostgreSQL schema query
      columns = await queryDatabase(
        connection,
        `SELECT column_name, data_type, is_nullable, column_default 
         FROM information_schema.columns 
         WHERE table_name = $1 AND table_schema = 'public'
         ORDER BY ordinal_position`,
        [tableName]
      );

      primaryKey = await queryDatabase(
        connection,
        `SELECT kcu.column_name
         FROM information_schema.table_constraints tc
         JOIN information_schema.key_column_usage kcu 
           ON tc.constraint_name = kcu.constraint_name
         WHERE tc.constraint_type = 'PRIMARY KEY' 
           AND tc.table_name = $1 AND tc.table_schema = 'public'`,
        [tableName]
      );

      const primaryKeyNames = (primaryKey as any[]).map(
        (row) => row.column_name
      );
      return NextResponse.json({ columns, primaryKey: primaryKeyNames });
    } else {
      // MySQL schema query
      columns = await queryDatabase(connection, `DESCRIBE ${tableName}`);
      const primaryKeyResult = await queryDatabase(
        connection,
        `SHOW KEYS FROM ${tableName} WHERE Key_name = 'PRIMARY'`
      );
      const primaryKey = (primaryKeyResult as any[]).map(
        (row) => row.Column_name
      );
      return NextResponse.json({ columns, primaryKey });
    }
  } catch (error) {
    console.error("API Schema Error:", error);
    return new NextResponse(
      JSON.stringify({
        message: `Failed to fetch schema: ${(error as Error).message}`,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    if (connection) {
      await disconnectFromDatabase(connection);
    }
  }
}
