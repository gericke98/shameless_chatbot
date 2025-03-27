import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import db from "@/db/drizzle";
import { messages } from "@/db/schema";
import { z } from "zod";

export const dynamic = "force-dynamic";

// Validation schema
const messageSchema = z.object({
  sender: z.enum(["user", "bot", "admin"], {
    message: "Sender must be 'user', 'bot', or 'admin'",
  }),
  text: z.string().min(1, "Message content cannot be empty"),
  timestamp: z.string(),
  ticketId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const { ticketId, message } = await request.json();

    if (!ticketId || !message) {
      return NextResponse.json(
        { error: "Missing ticketId or message" },
        { status: 400 }
      );
    }

    // Validate message data
    const validatedMessage = messageSchema.parse({
      ...message,
      ticketId,
    });

    // Add message to database
    await db.insert(messages).values({
      sender: validatedMessage.sender,
      text: validatedMessage.text,
      timestamp: validatedMessage.timestamp,
      ticketId: validatedMessage.ticketId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding message:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          status: 400,
          error: `Invalid message data: ${error.errors[0].message}`,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to add message" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const ticketId = request.nextUrl.searchParams.get("ticketId");

  if (!ticketId) {
    return NextResponse.json(
      { error: "Missing ticketId parameter" },
      { status: 400 }
    );
  }

  try {
    const messages = await db.query.messages.findMany({
      where: (messages, { eq }) => eq(messages.ticketId, ticketId),
      orderBy: (messages, { asc }) => [asc(messages.timestamp)],
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
