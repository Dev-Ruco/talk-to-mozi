-- Adicionar coluna details aos logs para guardar metadados de cada etapa
ALTER TABLE agent_logs ADD COLUMN IF NOT EXISTS details JSONB;

-- Habilitar realtime na tabela agent_logs
ALTER PUBLICATION supabase_realtime ADD TABLE agent_logs;