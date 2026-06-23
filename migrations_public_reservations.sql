-- Clientes/ciudadanos y solicitudes publicas de reserva.
-- Ejecutar en Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.citizens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.reservation_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    citizen_id UUID NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
    complex_id UUID REFERENCES public.complexes(id) ON DELETE SET NULL,
    sport_id UUID REFERENCES public.sports(id) ON DELETE RESTRICT,
    sport TEXT NOT NULL,
    court_id UUID REFERENCES public.courts(id) ON DELETE SET NULL,
    preferred_date DATE NOT NULL,
    preferred_time TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled', 'completed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.reservation_requests
ADD COLUMN IF NOT EXISTS complex_id UUID REFERENCES public.complexes(id) ON DELETE SET NULL;

ALTER TABLE public.reservation_requests
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.reservation_requests
ADD COLUMN IF NOT EXISTS sport_id UUID REFERENCES public.sports(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS reservation_requests_user_id_idx
ON public.reservation_requests(user_id);

CREATE INDEX IF NOT EXISTS reservation_requests_sport_id_idx
ON public.reservation_requests(sport_id);

CREATE INDEX IF NOT EXISTS reservation_requests_status_idx
ON public.reservation_requests(status);

CREATE INDEX IF NOT EXISTS reservation_requests_preferred_date_idx
ON public.reservation_requests(preferred_date);

CREATE INDEX IF NOT EXISTS reservation_requests_complex_id_idx
ON public.reservation_requests(complex_id);

ALTER TABLE public.citizens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "citizens_public_insert_policy" ON public.citizens;
DROP POLICY IF EXISTS "citizens_admin_select_policy" ON public.citizens;
DROP POLICY IF EXISTS "reservation_requests_public_insert_policy" ON public.reservation_requests;
DROP POLICY IF EXISTS "reservation_requests_user_select_own_policy" ON public.reservation_requests;
DROP POLICY IF EXISTS "reservation_requests_admin_select_policy" ON public.reservation_requests;
DROP POLICY IF EXISTS "reservation_requests_admin_update_policy" ON public.reservation_requests;

CREATE POLICY "citizens_admin_select_policy"
ON public.citizens
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM public.user_profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);

CREATE POLICY "reservation_requests_admin_select_policy"
ON public.reservation_requests
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM public.user_profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);

CREATE POLICY "reservation_requests_user_select_own_policy"
ON public.reservation_requests
FOR SELECT
USING (
    user_id = auth.uid()
);

CREATE POLICY "reservation_requests_admin_update_policy"
ON public.reservation_requests
FOR UPDATE
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
