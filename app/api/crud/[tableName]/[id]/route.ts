import { NextRequest, NextResponse } from "next/server";
import {
  connectToDatabase,
  queryDatabase,
  disconnectFromDatabase,
} from "../../../../../lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ tableName: string; id: string }> }
) {
  const { tableName, id } = await params;
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

    const setClauses = Object.keys(body)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = [...Object.values(body), id];

    const query = `UPDATE ${tableName} SET ${setClauses} WHERE id = ?`;
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ tableName: string; id: string }> }
) {
  const { tableName, id } = await params;

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

    const query = `DELETE FROM ${tableName} WHERE id = ?`;
    await queryDatabase(connection, query, [id]);

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
