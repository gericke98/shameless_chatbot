import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { tickets } from "@/db/schema";
import { desc } from "drizzle-orm";
import { sql } from "drizzle-orm";

const ITEMS_PER_PAGE = 20;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const offset = (page - 1) * ITEMS_PER_PAGE;

    // Get total count
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(tickets);
    const total = totalCount[0].count;
    const hasMore = offset + ITEMS_PER_PAGE < total;

    // Get paginated tickets
    const result = await db
      .select()
      .from(tickets)
      .orderBy(desc(tickets.createdAt))
      .limit(ITEMS_PER_PAGE)
      .offset(offset);

    return NextResponse.json({
      tickets: result,
      hasMore,
      total,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}
