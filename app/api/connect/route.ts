
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, disconnectFromDatabase } from '../../../lib/db';

export async function POST(req: NextRequest) {
  let connection;
  try {
    const details = await req.json();
    connection = await connectToDatabase(details);
    return new NextResponse(null, { status: 200 });
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
