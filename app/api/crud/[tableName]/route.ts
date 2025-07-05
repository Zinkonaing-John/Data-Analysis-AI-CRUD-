
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, queryDatabase, disconnectFromDatabase } from '../../../../lib/db';

export async function POST(req: NextRequest, { params }: { params: { tableName: string } }) {
  const { tableName } = params;
  const body = await req.json();

  let connection;
  try {
    connection = await connectToDatabase();
    const columns = Object.keys(body).join(', ');
    const values = Object.values(body);
    const placeholders = values.map(() => '?').join(', ');

    const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
    await queryDatabase(connection, query, values);

    return new NextResponse(null, { status: 204 });
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
