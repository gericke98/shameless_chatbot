import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { messages } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get("ticketId");

    if (!ticketId) {
      return NextResponse.json(
        { error: "Ticket ID is required" },
        { status: 400 }
      );
    }

    const result = await db
      .select()
      .from(messages)
      .where(eq(messages.ticketId, ticketId));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sender, text, ticketId } = body;

    if (!sender || !text || !ticketId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newMessage = {
      sender,
      text,
      timestamp: new Date().toISOString(),
      ticketId,
    };

    const result = await db.insert(messages).values(newMessage).returning();
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}
