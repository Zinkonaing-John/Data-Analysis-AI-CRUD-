
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, queryDatabase, disconnectFromDatabase } from '../../../lib/db';

export async function POST(req: NextRequest) {
  let connection;
  try {
    connection = await connectToDatabase();
    const { query } = await req.json();
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
