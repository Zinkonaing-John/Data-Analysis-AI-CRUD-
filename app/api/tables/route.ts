
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, queryDatabase, disconnectFromDatabase } from '../../../lib/db';

export async function GET(req: NextRequest) {
  let connection;
  try {
    connection = await connectToDatabase();
    const tables = await queryDatabase(connection, 'SHOW TABLES');
    const tableNames = (tables as any[]).map(table => Object.values(table)[0]);
    return NextResponse.json(tableNames);
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
