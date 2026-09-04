import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { publishRoast } from "@/lib/neon";
import { roastResultSchema } from "@/types/roast";

export async function POST(request: Request) {
  try {
    const roast = roastResultSchema.parse(await request.json());
    if (roast.attribution) {
      roast.attribution.consentedAt = new Date().toISOString();
    }
    const data = await publishRoast(roast);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ success: false, error: "Invalid roast or X handle. Public handles require tagging consent." }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Could not publish roast.' }, { status: 500 });
  }
}
