
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, queryDatabase, disconnectFromDatabase } from '../../../../../lib/db';

export async function PUT(req: NextRequest, { params }: { params: { tableName: string, id: string } }) {
  const { tableName, id } = params;
  const body = await req.json();

  let connection;
  try {
    connection = await connectToDatabase();
    const setClauses = Object.keys(body).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(body), id];

    const query = `UPDATE ${tableName} SET ${setClauses} WHERE id = ?`;
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

export async function function DELETE(req: NextRequest, { params }: { params: { tableName: string, id: string } }) {
  const { tableName, id } = params;

  let connection;
  try {
    connection = await connectToDatabase();
    const query = `DELETE FROM ${tableName} WHERE id = ?`;
    await queryDatabase(connection, query, [id]);

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
