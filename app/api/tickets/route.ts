import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import db from "@/db/drizzle";
import { tickets, messages } from "@/db/schema";
import { z } from "zod";

export const dynamic = "force-dynamic";

// Validation schema
const messageSchema = z.object({
  sender: z.enum(["user", "bot", "admin"], {
    message: "Sender must be 'user', 'bot', or 'admin'",
  }),
  text: z.string().min(1, "Message content cannot be empty"),
  timestamp: z.string(),
  status: z.string().optional(),
  admin: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedMessage = messageSchema.parse(body);

    // Generate ticket ID
    const ticketId = crypto.randomUUID();

    // Create ticket
    const newTicket = await db
      .insert(tickets)
      .values({
        id: ticketId,
        orderNumber: null,
        email: null,
        status: validatedMessage.status || "open",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        admin: validatedMessage.admin || false,
      })
      .returning();

    // Add the first message
    await db.insert(messages).values({
      sender: validatedMessage.sender,
      text: validatedMessage.text,
      timestamp: validatedMessage.timestamp,
      ticketId: ticketId,
    });

    return NextResponse.json({
      status: 200,
      data: newTicket[0],
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
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
      {
        status: 500,
        error: "Failed to create ticket",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const ticketId = request.nextUrl.searchParams.get("ticketId");

    if (!ticketId) {
      return NextResponse.json(
        { error: "Missing ticketId parameter" },
        { status: 400 }
      );
    }

    const ticket = await db.query.tickets.findFirst({
      where: (tickets, { eq }) => eq(tickets.id, ticketId),
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ data: ticket });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticket" },
      { status: 500 }
    );
  }
}
