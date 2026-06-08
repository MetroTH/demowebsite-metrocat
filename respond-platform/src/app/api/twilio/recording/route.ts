import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// POST /api/twilio/recording — Twilio recording status callback
export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const callSid = formData.get("CallSid") as string | null;
  const recordingUrl = formData.get("RecordingUrl") as string | null;
  const recordingSid = formData.get("RecordingSid") as string | null;

  if (!callSid) {
    return NextResponse.json({ error: "CallSid required" }, { status: 400 });
  }

  if (!recordingUrl) {
    // Nothing to store yet — Twilio may send this before the recording is ready
    return NextResponse.json({ ok: true });
  }

  const admin = await createAdminClient();

  // Append .mp3 if not already present (Twilio recording URLs are format-agnostic)
  const formattedUrl = recordingUrl.endsWith(".mp3")
    ? recordingUrl
    : `${recordingUrl}.mp3`;

  const { error } = await admin
    .from("ip_calls")
    .update({ recording_url: formattedUrl })
    .eq("twilio_sid", callSid);

  if (error) {
    console.error("[twilio/recording] Update error:", error, { recordingSid });
  }

  return NextResponse.json({ ok: true });
}
