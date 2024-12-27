const db = require("../../../../db");
import { NextResponse } from "next/server";

export async function POST(req) {
  const { userId, userData } = await req.json();
  const client = await db.getClient();
  try {
    await client.query("BEGIN");
    const updateQuery = `
        INSERT INTO user_data_spotify (user_name, data, created_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        ON CONFLICT (user_name) 
        DO UPDATE SET 
        data = EXCLUDED.data,
        created_at = EXCLUDED.created_at;

    `;
    await client.query(updateQuery, [userId, userData]);
    await client.query("COMMIT");
    return NextResponse.json(
      { message: "Datos actualizados exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error actualizando la base de datos:", error);
    return NextResponse.json(
      { error: "Error actualizando la base de datos" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
