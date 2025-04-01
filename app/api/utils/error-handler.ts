import { NextResponse } from "next/server";

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_SERVER_ERROR"
  ) {
    super(message);
    this.name = "APIError";
  }
}

interface ErrorResponse {
  error: {
    message: string;
    code: string;
    timestamp: string;
    requestId?: string;
  };
}

export function handleError(
  error: unknown,
  requestId?: string
): NextResponse<ErrorResponse> {
  console.error("[Error]", {
    timestamp: new Date().toISOString(),
    requestId,
    error:
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error,
  });

  const corsHeaders = {
    "Access-Control-Allow-Origin":
      "https://shamelesscollective.com,https://shameless-test.myshopify.com",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
  };

  if (error instanceof APIError) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code,
          timestamp: new Date().toISOString(),
          requestId,
        },
      },
      {
        status: error.statusCode,
        headers: corsHeaders,
      }
    );
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      error: {
        message: "An unexpected error occurred",
        code: "INTERNAL_SERVER_ERROR",
        timestamp: new Date().toISOString(),
        requestId,
      },
    },
    {
      status: 500,
      headers: corsHeaders,
    }
  );
}

export function createRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
