-- Modulo de socios y credenciales.
-- Ejecutar en Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    complex_id UUID NOT NULL REFERENCES public.complexes(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    dni TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    photo_url TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE (complex_id, dni)
);

CREATE TABLE IF NOT EXISTS public.member_credentials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    complex_id UUID NOT NULL REFERENCES public.complexes(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    membership_type TEXT NOT NULL DEFAULT 'mensual',
    enabled_activities TEXT[] NOT NULL DEFAULT '{}',
    issued_at DATE NOT NULL DEFAULT CURRENT_DATE,
    expires_at DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.membership_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    complex_id UUID NOT NULL REFERENCES public.complexes(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    dni TEXT NOT NULL,
    phone TEXT,
    email TEXT NOT NULL,
    requested_membership_type TEXT NOT NULL DEFAULT 'mensual',
    requested_activities TEXT[] NOT NULL DEFAULT '{}',
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS members_complex_id_idx ON public.members(complex_id);
CREATE INDEX IF NOT EXISTS members_user_id_idx ON public.members(user_id);
CREATE INDEX IF NOT EXISTS members_email_idx ON public.members(email);
CREATE INDEX IF NOT EXISTS member_credentials_member_id_idx ON public.member_credentials(member_id);
CREATE INDEX IF NOT EXISTS member_credentials_complex_id_idx ON public.member_credentials(complex_id);
CREATE INDEX IF NOT EXISTS member_credentials_code_idx ON public.member_credentials(code);
CREATE INDEX IF NOT EXISTS membership_requests_complex_id_idx ON public.membership_requests(complex_id);
CREATE INDEX IF NOT EXISTS membership_requests_user_id_idx ON public.membership_requests(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS membership_requests_pending_unique_idx
ON public.membership_requests(user_id, complex_id)
WHERE status = 'pending';

UPDATE public.members
SET user_id = user_profiles.id
FROM public.user_profiles
WHERE members.user_id IS NULL
AND members.email IS NOT NULL
AND lower(members.email) = lower(user_profiles.email);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "members_admin_all_policy" ON public.members;
DROP POLICY IF EXISTS "members_user_select_own_policy" ON public.members;
DROP POLICY IF EXISTS "member_credentials_admin_all_policy" ON public.member_credentials;
DROP POLICY IF EXISTS "member_credentials_user_select_own_policy" ON public.member_credentials;
DROP POLICY IF EXISTS "membership_requests_admin_all_policy" ON public.membership_requests;
DROP POLICY IF EXISTS "membership_requests_user_insert_policy" ON public.membership_requests;
DROP POLICY IF EXISTS "membership_requests_user_select_own_policy" ON public.membership_requests;

CREATE POLICY "members_admin_all_policy"
ON public.members
FOR ALL
USING (
    EXISTS (
        SELECT 1
        FROM public.user_profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.user_profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);

CREATE POLICY "members_user_select_own_policy"
ON public.members
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "member_credentials_admin_all_policy"
ON public.member_credentials
FOR ALL
USING (
    EXISTS (
        SELECT 1
        FROM public.user_profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.user_profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);

CREATE POLICY "member_credentials_user_select_own_policy"
ON public.member_credentials
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM public.members
        WHERE members.id = member_credentials.member_id
        AND members.user_id = auth.uid()
    )
);

CREATE POLICY "membership_requests_admin_all_policy"
ON public.membership_requests
FOR ALL
USING (
    EXISTS (
        SELECT 1
        FROM public.user_profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.user_profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);

CREATE POLICY "membership_requests_user_insert_policy"
ON public.membership_requests
FOR INSERT
WITH CHECK (
    user_id = auth.uid()
    AND lower(email) = lower(auth.jwt() ->> 'email')
);

CREATE POLICY "membership_requests_user_select_own_policy"
ON public.membership_requests
FOR SELECT
USING (user_id = auth.uid());

DROP FUNCTION IF EXISTS public.approve_membership_request(UUID, DATE);

CREATE OR REPLACE FUNCTION public.approve_membership_request(
    p_request_id UUID,
    p_expires_at DATE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_request public.membership_requests%ROWTYPE;
    v_member_id UUID;
    v_credential_id UUID;
    v_code TEXT;
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM public.user_profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'No tenes permisos para aprobar solicitudes.';
    END IF;

    IF p_expires_at IS NULL OR p_expires_at < CURRENT_DATE THEN
        RAISE EXCEPTION 'La fecha de vencimiento no puede ser anterior a hoy.';
    END IF;

    SELECT *
    INTO v_request
    FROM public.membership_requests
    WHERE id = p_request_id
    AND status = 'pending'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'La solicitud no existe o ya fue procesada.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.members
        WHERE complex_id = v_request.complex_id
        AND dni = v_request.dni
    ) THEN
        RAISE EXCEPTION 'Ya existe un socio con ese DNI en este complejo.';
    END IF;

    INSERT INTO public.members (
        user_id,
        complex_id,
        first_name,
        last_name,
        dni,
        phone,
        email,
        status,
        notes
    )
    VALUES (
        v_request.user_id,
        v_request.complex_id,
        v_request.first_name,
        v_request.last_name,
        v_request.dni,
        v_request.phone,
        lower(v_request.email),
        'active',
        v_request.notes
    )
    RETURNING id INTO v_member_id;

    v_code := 'CRED-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

    INSERT INTO public.member_credentials (
        member_id,
        complex_id,
        code,
        membership_type,
        enabled_activities,
        expires_at,
        status
    )
    VALUES (
        v_member_id,
        v_request.complex_id,
        v_code,
        v_request.requested_membership_type,
        v_request.requested_activities,
        p_expires_at,
        'active'
    )
    RETURNING id INTO v_credential_id;

    UPDATE public.membership_requests
    SET status = 'approved',
        updated_at = TIMEZONE('utc'::text, NOW())
    WHERE id = v_request.id;

    RETURN v_credential_id;
END;
$$;

REVOKE ALL ON FUNCTION public.approve_membership_request(UUID, DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_membership_request(UUID, DATE) TO authenticated;

DROP FUNCTION IF EXISTS public.get_public_credential_validation(TEXT);

CREATE OR REPLACE FUNCTION public.get_public_credential_validation(p_code TEXT)
RETURNS TABLE (
    id UUID,
    code TEXT,
    membership_type TEXT,
    enabled_activities TEXT[],
    issued_at DATE,
    expires_at DATE,
    status TEXT,
    complex_id UUID,
    member_id UUID,
    first_name TEXT,
    last_name TEXT,
    masked_dni TEXT,
    member_status TEXT,
    complex_name TEXT,
    complex_logo_url TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
    SELECT
        credentials.id,
        credentials.code,
        credentials.membership_type,
        credentials.enabled_activities,
        credentials.issued_at,
        credentials.expires_at,
        CASE
            WHEN credentials.expires_at < CURRENT_DATE THEN 'expired'
            ELSE credentials.status
        END,
        credentials.complex_id,
        members.id,
        members.first_name,
        members.last_name,
        '***' || right(members.dni, 3),
        members.status,
        complexes.name,
        complexes.logo_url
    FROM public.member_credentials AS credentials
    JOIN public.members AS members ON members.id = credentials.member_id
    JOIN public.complexes AS complexes ON complexes.id = credentials.complex_id
    WHERE credentials.code = upper(trim(p_code))
    LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_public_credential_validation(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_credential_validation(TEXT) TO anon, authenticated;
