import { NextResponse } from "next/server";

export class ApiError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode: number = 500, code: string = "INTERNAL_ERROR") {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export async function handleApiError(error: unknown): Promise<NextResponse> {
  if (error instanceof ApiError) {
    const body: Record<string, unknown> = { success: false, message: error.message };

    if (process.env.NODE_ENV === "development") {
      body.devMessage = error.message;
    }

    return NextResponse.json(body, { status: error.statusCode });
  }

  const prismaErrorClass = await getPrismaErrorClass();

  if (prismaErrorClass && error instanceof prismaErrorClass) {
    const prismaError = error as { code: string; message?: string };

    switch (prismaError.code) {
      case "P2002":
        return NextResponse.json(
          { success: false, message: "A record with this value already exists." },
          { status: 409 }
        );
      case "P2025":
        return NextResponse.json(
          { success: false, message: "The requested record was not found." },
          { status: 404 }
        );
      default: {
        const body: Record<string, unknown> = {
          success: false,
          message: "An unexpected database error occurred.",
        };

        if (process.env.NODE_ENV === "development") {
          body.devMessage = prismaError.message ?? `Prisma error code: ${prismaError.code}`;
        }

        return NextResponse.json(body, { status: 500 });
      }
    }
  }

  const body: Record<string, unknown> = {
    success: false,
    message: "An unexpected error occurred.",
  };

  if (process.env.NODE_ENV === "development") {
    body.devMessage = error instanceof Error ? error.message : String(error);
  }

  return NextResponse.json(body, { status: 500 });
}

async function getPrismaErrorClass(): Promise<(new (...args: never[]) => object) | null> {
  try {
    const { Prisma } = await import("@prisma/client");
    return Prisma.PrismaClientKnownRequestError;
  } catch {
    return null;
  }
}
