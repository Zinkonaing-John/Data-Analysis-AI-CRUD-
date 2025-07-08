
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, queryDatabase, disconnectFromDatabase } from '../../../lib/db';

export async function POST(req: NextRequest) {
  let connection;
  let connectionDetails: any; // Declare connectionDetails here
  let query: string;

  try {
    if (process.env.NODE_ENV === 'production') {
      // In production, try to connect using environment variables (Supabase)
      connection = await connectToDatabase();
      // For production, assume PostgreSQL if connected via env vars
      connectionDetails = { dbType: "PostgreSQL" };
      const body = await req.json();
      query = body.query;
    } else {
      // In development, use connection details from the request body
      const body = await req.json();
      query = body.query;
      connectionDetails = body.connectionDetails;
      connection = await connectToDatabase(connectionDetails);
    }

    const results = await queryDatabase(connection, query);
    return NextResponse.json(results);
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ message: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    if (connection) {
      await disconnectFromDatabase(connection);
    }
  }
}
