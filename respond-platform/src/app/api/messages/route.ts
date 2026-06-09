import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendMessage as sendLineMesage } from "@/lib/channels/line";
import { sendMessage as sendWhatsAppMessage } from "@/lib/channels/whatsapp";
import { sendMessage as sendFacebookMessage } from "@/lib/channels/facebook";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface SendMessageBody {
  conversationId: string;
  content: string;
}

export async function POST(request: NextRequest) {
  // Authenticate the caller
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: SendMessageBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { conversationId, content } = body;
  if (!conversationId || !content) {
    return NextResponse.json(
      { error: "conversationId and content are required" },
      { status: 400 }
    );
  }

  // Resolve the agent's ip_profiles.id from the authenticated session
  const { data: profile } = await supabase
    .from("ip_profiles")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();
  const agentProfileId = profile?.id ?? null;

  // Use admin client for DB writes so RLS doesn't block internal ops
  const admin = createAdminClient();

  // Fetch the conversation with its contact
  const { data: conversation, error: convError } = await admin
    .from("ip_conversations")
    .select("id, channel, contact:ip_contacts(id, external_id, phone, name)")
    .eq("id", conversationId)
    .single();

  if (convError || !conversation) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  const channel = conversation.channel;
  // contact comes back as an array when using a foreign key join
  const contact = Array.isArray(conversation.contact)
    ? conversation.contact[0]
    : conversation.contact;

  if (!contact) {
    return NextResponse.json(
      { error: "Contact not found for this conversation" },
      { status: 404 }
    );
  }

  // Fetch channel config credentials
  const { data: channelConfig } = await admin
    .from("ip_channel_configs")
    .select("credentials")
    .eq("type", channel)
    .eq("enabled", true)
    .limit(1)
    .maybeSingle();

  // Insert the outbound message with status "sending"
  const { data: message, error: insertError } = await admin
    .from("ip_messages")
    .insert({
      conversation_id: conversationId,
      content,
      sender: "agent",
      agent_id: agentProfileId,
      status: "sending",
      type: "text",
    })
    .select()
    .single();

  if (insertError || !message) {
    return NextResponse.json(
      { error: "Failed to insert message" },
      { status: 500 }
    );
  }

  // Dispatch to the correct channel
  let dispatchError: string | null = null;

  try {
    if (!channelConfig) {
      throw new Error(`No enabled channel config found for channel: ${channel}`);
    }

    const creds = channelConfig.credentials as Record<string, string>;
    const externalId = contact.external_id ?? "";
    const phone = contact.phone ?? externalId;

    switch (channel) {
      case "line": {
        const accessToken = creds.channel_access_token ?? "";
        await sendLineMesage(
          externalId,
          [{ type: "text", text: content }],
          accessToken
        );
        break;
      }
      case "whatsapp": {
        const phoneNumberId = creds.phone_number_id ?? "";
        const accessToken = creds.access_token ?? "";
        await sendWhatsAppMessage(phoneNumberId, phone, content, accessToken);
        break;
      }
      case "facebook": {
        const pageId = creds.page_id ?? "";
        const accessToken = creds.access_token ?? "";
        await sendFacebookMessage(pageId, externalId, content, accessToken);
        break;
      }
      default:
        throw new Error(`Unsupported outbound channel: ${channel}`);
    }
  } catch (err) {
    console.error("[messages/POST] Dispatch error:", err);
    dispatchError = err instanceof Error ? err.message : String(err);
  }

  // Update message status based on dispatch result
  const newStatus = dispatchError ? "failed" : "sent";
  const { data: updatedMessage } = await admin
    .from("ip_messages")
    .update({ status: newStatus })
    .eq("id", message.id)
    .select()
    .single();

  // Also update conversation updated_at
  await admin
    .from("ip_conversations")
    .update({
      updated_at: new Date().toISOString(),
      last_message_id: message.id,
    })
    .eq("id", conversationId);

  if (dispatchError) {
    return NextResponse.json(
      {
        message: updatedMessage ?? message,
        warning: `Message saved but delivery failed: ${dispatchError}`,
      },
      { status: 207 }
    );
  }

  return NextResponse.json({ message: updatedMessage ?? message }, { status: 201 });
}
