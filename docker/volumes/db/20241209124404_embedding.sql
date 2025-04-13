CREATE EXTENSION IF NOT EXISTS vector;

-- secret for the supabase url
select vault.create_secret(
  'http://kong:8000',
  'supabase_url'
);

-- function to get the supabase url
CREATE FUNCTION supabase_url()
RETURNS TEXT
language plpgsql
security definer
as $$
declare
  secret_value text;
begin
  select decrypted_secret into secret_value from vault.decrypted_secrets where name = 'supabase_url';
  return secret_value;
end;
$$;

create function private.generateChunk()
returns trigger
language plpgsql
as $$
declare
  url text;
  result int;
begin
  IF NEW.updated IS True THEN
    select
      net.http_post(
        url := supabase_url() || '/functions/v1/generateChunks',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', current_setting('request.headers')::json->>'authorization'
        ),
        body := jsonb_build_object(
          'link', NEW.Link,
          'nome', NEW.Nome,
          'objID', NEW.storage_object_id
        )
      )
    into result;
  END IF;
  return null;
end;
$$;

-- trigger to generate chunks
create trigger generateChunks
   after insert or update on public.Manuale
   for each row
   execute procedure private.generateChunk();

-- -- function to embed the document sections
-- create function private.embedChunk() 
-- returns trigger 
-- language plpgsql
-- as $$
-- declare
--   url text;
--   result int;
-- begin
--   If NEW.embedding IS NULL OR OLD.Contenuto <> NEW.Contenuto THEN
--     select
--       net.http_post(
--         url := supabase_url() || '/functions/v1/embed',
--         headers := jsonb_build_object(
--           'Content-Type', 'application/json',
--           'Authorization', current_setting('request.headers')::json->>'authorization'
--         ),
--         body := jsonb_build_object(
--           'content', NEW.Contenuto,
--           'manuale', NEW.Manuale,
--           'n_chunk', NEW.NChunk 
--         )
--       )
--     into result;
--   END IF;
--   return null;
-- end;
-- $$;

-- -- trigger to embed the document sections
-- create trigger embedDocumentsChunk
--   after insert or update on public.Manuale_Sezione
--   for each row
--   execute procedure private.embedChunk();