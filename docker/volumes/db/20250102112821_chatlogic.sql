-- functions fo question embedding
create function private.getAnswer() 
returns trigger 
language plpgsql
as $$
declare
  url text;
  result int;
begin
    select
        net.http_post(
            url := supabase_url() || '/functions/v1/chat',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', current_setting('request.headers')::json->>'authorization'
            ),
            body := jsonb_build_object(
                'question', NEW.domanda,
                'id', NEW.id,
                'chat_id', NEW.chat
            )
        )
    into result;
    
  return null;
end;
$$;

-- trigger to embed the question
create trigger add_question
  after insert on public.Messaggio
  for each row
  execute procedure private.getAnswer();


-- function to get last 3messages
CREATE OR REPLACE FUNCTION public.getlastmessages(chat_id uuid)
RETURNS jsonb 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', m.id,
        'domanda', m.domanda,
        'risposta', m.risposta
      )
      ORDER BY m.createdat ASC
    )
    FROM (
      SELECT
        m.id,
        m.domanda,
        m.risposta,
        m.createdat
      FROM
        public.messaggio m
      WHERE
        m.chat = chat_id
      ORDER BY
        m.createdat DESC
      LIMIT 3
    ) AS m
  );
END;
$$;


