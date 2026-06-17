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
USING (
    user_id = auth.uid()
    OR lower(email) = lower(auth.jwt() ->> 'email')
);

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
        AND (
            members.user_id = auth.uid()
            OR lower(members.email) = lower(auth.jwt() ->> 'email')
        )
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
