
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, queryDatabase, disconnectFromDatabase } from '../../../lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tableName = searchParams.get('tableName');

  if (!tableName) {
    return new NextResponse(
      JSON.stringify({ message: 'Table name is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let connection;
  try {
    connection = await connectToDatabase();
    const columns = await queryDatabase(connection, `DESCRIBE ${tableName}`);
    const primaryKeyResult = await queryDatabase(connection, `SHOW KEYS FROM ${tableName} WHERE Key_name = 'PRIMARY'`);
    const primaryKey = (primaryKeyResult as any[]).map(row => row.Column_name);
    return NextResponse.json({ columns, primaryKey });
  } catch (error) {
    console.error('API Schema Error:', error);
    return new NextResponse(
      JSON.stringify({ message: `Failed to fetch schema: ${(error as Error).message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    if (connection) {
      await disconnectFromDatabase(connection);
    }
  }
}
