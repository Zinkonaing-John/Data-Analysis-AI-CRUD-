
import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(req: NextRequest) {
  let connection;
  try {
    const details = await req.json();
    connection = await mysql.createConnection({
      host: details.host,
      user: details.username,
      password: details.password,
      database: details.dbName,
      port: parseInt(details.port, 10)
    });
    await connection.query('SELECT 1'); // Test the connection
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ message: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
