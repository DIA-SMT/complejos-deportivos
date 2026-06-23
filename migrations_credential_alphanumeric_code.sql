-- Identificador alfanumérico legible para nuevas credenciales.
-- Las credenciales existentes conservan su código y siguen siendo válidas.

BEGIN;

CREATE OR REPLACE FUNCTION private.generate_credential_code()
RETURNS TEXT
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = pg_catalog
AS $$
DECLARE
    v_alphabet CONSTANT TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    v_first TEXT := '';
    v_second TEXT := '';
    v_candidate TEXT;
    v_index INTEGER;
BEGIN
    LOOP
        v_first := '';
        v_second := '';

        FOR v_index IN 1..4 LOOP
            v_first := v_first || substr(
                v_alphabet,
                floor(random() * length(v_alphabet))::INTEGER + 1,
                1
            );
            v_second := v_second || substr(
                v_alphabet,
                floor(random() * length(v_alphabet))::INTEGER + 1,
                1
            );
        END LOOP;

        v_candidate := 'DM-' || v_first || '-' || v_second;

        EXIT WHEN NOT EXISTS (
            SELECT 1
            FROM public.member_credentials
            WHERE code = v_candidate
        );
    END LOOP;

    RETURN v_candidate;
END;
$$;

REVOKE ALL ON FUNCTION private.generate_credential_code() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.generate_credential_code() TO authenticated;

CREATE OR REPLACE FUNCTION private.assign_credential_code()
RETURNS TRIGGER
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = pg_catalog, public, private
AS $$
BEGIN
    NEW.code := private.generate_credential_code();
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.assign_credential_code() FROM PUBLIC;

DROP TRIGGER IF EXISTS assign_member_credential_code
ON public.member_credentials;

CREATE TRIGGER assign_member_credential_code
BEFORE INSERT ON public.member_credentials
FOR EACH ROW
EXECUTE FUNCTION private.assign_credential_code();

COMMIT;
