-- Deportes y canchas configurables por complejo.
-- Ejecutar en Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.sports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.sports
ADD COLUMN IF NOT EXISTS icon_url TEXT;

ALTER TABLE public.courts
ADD COLUMN IF NOT EXISTS icon_url TEXT;

ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sports_select_policy" ON public.sports;
DROP POLICY IF EXISTS "sports_insert_policy" ON public.sports;
DROP POLICY IF EXISTS "sports_update_policy" ON public.sports;
DROP POLICY IF EXISTS "sports_delete_policy" ON public.sports;

CREATE POLICY "sports_select_policy"
ON public.sports
FOR SELECT
USING (true);

CREATE POLICY "sports_insert_policy"
ON public.sports
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.user_profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);

CREATE POLICY "sports_update_policy"
ON public.sports
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

CREATE POLICY "sports_delete_policy"
ON public.sports
FOR DELETE
USING (
    EXISTS (
        SELECT 1
        FROM public.user_profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);

INSERT INTO public.sports (name)
VALUES
    ('Futbol'),
    ('Voley'),
    ('Basket'),
    ('Gimnasia'),
    ('Padel'),
    ('Natacion')
ON CONFLICT (name) DO NOTHING;

ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "courts_select_policy" ON public.courts;
DROP POLICY IF EXISTS "courts_insert_policy" ON public.courts;
DROP POLICY IF EXISTS "courts_update_policy" ON public.courts;
DROP POLICY IF EXISTS "courts_delete_policy" ON public.courts;

CREATE POLICY "courts_select_policy"
ON public.courts
FOR SELECT
USING (true);

CREATE POLICY "courts_insert_policy"
ON public.courts
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.user_profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);

CREATE POLICY "courts_update_policy"
ON public.courts
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

CREATE POLICY "courts_delete_policy"
ON public.courts
FOR DELETE
USING (
    EXISTS (
        SELECT 1
        FROM public.user_profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);
