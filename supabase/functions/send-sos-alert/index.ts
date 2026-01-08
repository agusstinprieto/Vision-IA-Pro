
// Supabase Edge Function: send-sos-alert
// Deploy with: supabase concepts functions deploy send-sos-alert

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

console.log("Hello from send-sos-alert!");

serve(async (req) => {
    const { record } = await req.json();

    // Validate payload
    if (!record || !record.risk_level) {
        return new Response(JSON.stringify({ error: 'Invalid Payload' }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    // Only trigger on Monitorable Events
    if (record.risk_level === 'HIGH' || record.risk_level === 'CRITICAL') {
        console.log(`[SOS TRIGGER] Critical Alert for Unit ${record.unit_id}`);

        try {
            // 1. Send to WhatsApp (Mock API Call)
            // In production, use Twilio/Meta API
            const message = `🚨 *ALERTA SOS SIMSA* 🚨\n\nUnidad: ${record.unit_id}\nRiesgo: ${record.risk_level}\nDetalle: ${record.ai_summary || 'N/A'}`;

            console.log(`Sending WhatsApp: ${message}`);

            // await fetch('https://graph.facebook.com/v17.0/YOUR_PHONE_ID/messages', { method: 'POST', body: ... })

            // 2. Send to Internal Slack/Telegram
            console.log(`Sending Telegram Alert...`);

            return new Response(
                JSON.stringify({ success: true, message: "Alerts dispatched" }),
                { headers: { "Content-Type": "application/json" } },
            );

        } catch (error) {
            return new Response(
                JSON.stringify({ error: error.message }),
                { status: 500, headers: { "Content-Type": "application/json" } },
            );
        }
    }

    return new Response(
        JSON.stringify({ message: "No alert required" }),
        { headers: { "Content-Type": "application/json" } },
    );
});
