import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import {
  verifySignature,
  parseEvents,
} from "@/lib/channels/line";
import {
  upsertContactAndConversation,
  insertInboundMessage,
} from "@/lib/channels/webhook-helpers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET — LINE verification endpoint
export async function GET() {
  return NextResponse.json({ status: "ok" });
}

// POST — receives LINE webhook events
export async function POST(request: NextRequest) {
  // Read raw body for signature verification
  const rawBody = Buffer.from(await request.arrayBuffer());

  const supabase = await createAdminClient();

  // Fetch the active LINE channel config
  const { data: config } = await supabase
    .from("ip_channel_configs")
    .select("*")
    .eq("type", "line")
    .eq("enabled", true)
    .limit(1)
    .maybeSingle();

  if (!config) {
    // Silently acknowledge — no config means we're not set up for LINE yet
    return NextResponse.json({ status: "ok" });
  }

  const creds = config.credentials as Record<string, string>;
  const channelSecret = creds.channel_secret ?? "";

  // Verify X-Line-Signature header
  const signature = request.headers.get("x-line-signature") ?? "";
  if (!verifySignature(rawBody, signature, channelSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Parse body JSON
  let body: unknown;
  try {
    body = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const events = parseEvents(body);
  const accessToken = creds.channel_access_token ?? "";

  for (const event of events) {
    if (event.type !== "message") continue;
    if (!event.message || event.message.type !== "text") continue;

    const userId = event.source.userId;
    const text = event.message.text ?? "";
    const messageId = event.message.id;

    try {
      const { conversationId } = await upsertContactAndConversation(supabase, {
        externalId: userId,
        name: userId, // LINE display names require an additional API call; use ID as fallback
        channel: "line",
      });

      await insertInboundMessage(supabase, {
        conversationId,
        content: text,
        externalId: messageId,
        type: "text",
      });
    } catch (err) {
      console.error("[LINE webhook] Error processing event:", err);
      // Continue processing remaining events even if one fails
    }
  }

  // LINE expects 200 OK; any other status causes a retry
  return NextResponse.json({ status: "ok" });
}
