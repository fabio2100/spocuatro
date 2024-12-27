const db = require("../../../../db");
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "No email provided" }, { status: 400 });
  }

  const client = await db.getClient();
  try {
    const query = `
      SELECT data, (NOW() - INTERVAL '7 days' >= created_at) AS actualizar FROM user_data_spotify WHERE user_name = $1;
    `;
    const result = await client.query(query, [email]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "No data found for the provided email" },
        { status: 404 }
      );
    }

    const userData = result.rows[0].data;
    const actualizar = result.rows[0].actualizar;
    return NextResponse.json({ userData, actualizar }, { status: 200 });
  } catch (error) {
    console.error("Error retrieving data from the database:", error);
    return NextResponse.json(
      { error: "Error retrieving data from the database" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
