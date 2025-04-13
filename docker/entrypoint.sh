#!/bin/bash
/bin/ollama serve & pid=$!
sleep 5

# Usa variabili di ambiente per i nomi dei modelli, con valori di default
LLM_EMBEDDING_MODEL=${LLM_EMBEDDING_MODEL:-mxbai-embed-large}
LLM_GENERATION_MODEL=${LLM_GENERATION_MODEL:-deepseek-r1:8b}

echo "🔴 Retrieve embedding model..."
ollama pull $LLM_EMBEDDING_MODEL
echo "🟢 Done!"

echo "🔴 Retrieve generation model..."
ollama pull $LLM_GENERATION_MODEL
echo "🟢 Done!"

wait $pid