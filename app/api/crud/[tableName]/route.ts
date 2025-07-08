import { NextRequest, NextResponse } from "next/server";
import {
  connectToDatabase,
  queryDatabase,
  disconnectFromDatabase,
} from "../../../../lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tableName: string }> }
) {
  const { tableName } = await params;
  const { body } = await req.json();

  let connection;
  let connectionDetails: any; // Declare connectionDetails here

  try {
    if (process.env.NODE_ENV === 'production') {
      // In production, try to connect using environment variables (Supabase)
      connection = await connectToDatabase();
      // For production, assume PostgreSQL if connected via env vars
      connectionDetails = { dbType: "PostgreSQL" };
    } else {
      // In development, use connection details from the request header
      const connectionDetailsString = req.headers.get("X-Connection-Details");
      connectionDetails = JSON.parse(connectionDetailsString || "{}");
      connection = await connectToDatabase(connectionDetails);
    }

    const columns = Object.keys(body).join(", ");
    const values = Object.values(body);
    const placeholders = values.map(() => "?").join(", ");

    const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
    await queryDatabase(connection, query, values);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
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
