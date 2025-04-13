-- function to match the query with Q&A !!! DA MODIFICARE
CREATE OR REPLACE FUNCTION match_qea (query_embedding vector(768))
returns TABLE (
  content TEXT, 
  score FLOAT
)
language SQL
as $$
  SELECT risposta, 1-(Domanda_embedding <=> query_embedding) as score
  FROM public.QeA
  WHERE 1-(Domanda_embedding <=> query_embedding) > 0.58
  ORDER BY score ASC
  LIMIT  5;
$$;

-- function to match the query with chunks
CREATE OR REPLACE FUNCTION match_manuale(
  query_text text,
  query_embedding vector(1024),
  documents text[],
  match_count int,
  full_text_weight float = 0.3,
  semantic_weight float = 1,
  rrf_k int = 50
)
RETURNS TABLE (contenuto text)
LANGUAGE sql
AS $$
WITH full_text AS (
  SELECT
    CONCAT(manuale, '-', nchunk) AS id,
    -- Note: ts_rank_cd is not indexable but will only rank matches of the where clause
    -- which shouldn't be too big
    ROW_NUMBER() OVER (ORDER BY ts_rank_cd(fts, websearch_to_tsquery(query_text)) DESC) AS rank_ix
  FROM
    manuale_sezione
  WHERE
    fts @@ websearch_to_tsquery(query_text) AND manuale_sezione.manuale = ANY(documents)
  ORDER BY rank_ix
  LIMIT LEAST(match_count, 30) * 2
),
semantic AS (
  SELECT
    CONCAT(manuale, '-', nchunk) AS id,
    ROW_NUMBER() OVER (ORDER BY embedding <=> query_embedding) AS rank_ix
  FROM
    manuale_sezione
  WHERE manuale_sezione.manuale = ANY(documents)
  ORDER BY rank_ix
  LIMIT LEAST(match_count, 30) * 2
)
SELECT
  manuale_sezione.contenuto
FROM
  full_text
  FULL OUTER JOIN semantic
    ON full_text.id = semantic.id
  JOIN manuale_sezione
  ON COALESCE(full_text.id, semantic.id) = CONCAT(manuale_sezione.manuale, '-', manuale_sezione.nchunk)
ORDER BY
  COALESCE(1.0 / (rrf_k + full_text.rank_ix), 0.0) * full_text_weight +
  COALESCE(1.0 / (rrf_k + semantic.rank_ix), 0.0) * semantic_weight DESC
LIMIT LEAST(match_count, 30);
$$;

-- function to get the manual key by name
CREATE OR REPLACE FUNCTION getPdfKeyByName(input TEXT)
RETURNS TEXT[]
LANGUAGE plpgsql
as $$
DECLARE
  output TEXT[];
BEGIN
  SELECT array_agg(Prodotto_Manuale.Manuale) INTO output 
  FROM Prodotto JOIN Prodotto_Manuale ON (Prodotto.ID = Prodotto_Manuale.Prodotto)
  WHERE Prodotto.Nome = input;

  RETURN output;
END;
$$;

-- function to get the manual key by ID
CREATE OR REPLACE FUNCTION getPdfKeyByID(input TEXT)
RETURNS TEXT[]
LANGUAGE plpgsql
as $$
DECLARE
  output TEXT[];
BEGIN
  SELECT array_agg(Prodotto_Manuale.Manuale) INTO output 
  FROM Prodotto JOIN Prodotto_Manuale ON (Prodotto.ID = Prodotto_Manuale.Prodotto)
  WHERE Prodotto.ID = input;

  RETURN output;
END;
$$;