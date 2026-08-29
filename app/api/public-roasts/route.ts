import { NextResponse } from "next/server";
import { publishRoast } from "@/lib/neon";
import { roastResultSchema } from "@/types/roast";

export async function POST(request: Request) {
  try {
    const roast = roastResultSchema.parse(await request.json());
    const data = await publishRoast(roast);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Could not publish roast.' }, { status: 500 });
  }
}
