
-- Enable the pg_net extension to make HTTP requests
create extension if not exists pg_net;

-- Function to Trigger Webhook
create or replace function trigger_sos_alert()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Check if Risk Level is High
  if NEW.risk_level in ('HIGH', 'CRITICAL') or NEW.result = 'FAIL' then
    -- Call the Edge Function (Replace URL with actual deployment URL)
    perform net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-sos-alert',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
      body := jsonb_build_object('record', row_to_json(NEW))
    );
  end if;
  return NEW;
end;
$$;

-- Create Trigger on inspections table
create trigger on_critical_inspection
  after insert
  on inspections
  for each row
  execute function trigger_sos_alert();
