-- Function to execute automations
CREATE OR REPLACE FUNCTION process_pipeline_automations()
RETURNS TRIGGER AS $$
DECLARE
    automation RECORD;
    lead_pipeline_id BIGINT;
BEGIN
    -- Only proceed if etapa_id has changed
    IF OLD.etapa_id IS DISTINCT FROM NEW.etapa_id THEN
        -- Get the pipeline_id for the lead (assuming it's in the lead record or we can get it from the stage)
        -- For now, we use the lead's pipeline_id
        lead_pipeline_id := NEW.pipeline_id;

        -- Find matching automations
        FOR automation IN
            SELECT * FROM pipeline_automacoes
            WHERE pipeline_id = lead_pipeline_id
            AND ativo = true
            AND gatilho = 'stage_change'
            AND (
                (gatilho_config->>'from' = 'any' OR (gatilho_config->>'from')::bigint = OLD.etapa_id)
                AND
                (gatilho_config->>'to' = 'any' OR (gatilho_config->>'to')::bigint = NEW.etapa_id)
            )
        LOOP
            -- Log the execution (Mock implementation)
            INSERT INTO pipeline_automacao_logs (
                automacao_id,
                lead_id,
                status,
                details
            ) VALUES (
                automation.id,
                NEW.id,
                'executed',
                jsonb_build_object(
                    'action_type', automation.acao_tipo,
                    'action_config', automation.acao_config,
                    'from_stage', OLD.etapa_id,
                    'to_stage', NEW.etapa_id,
                    'message', 'Automation triggered successfully (Mock)'
                )
            );
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Trigger
DROP TRIGGER IF EXISTS trigger_process_pipeline_automations ON leads;
CREATE TRIGGER trigger_process_pipeline_automations
    AFTER UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION process_pipeline_automations();
