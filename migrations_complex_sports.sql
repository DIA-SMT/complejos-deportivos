-- Deportes habilitados por complejo.
-- Permite que cada administrador gestione las disciplinas de sus complejos
-- sin modificar la configuración de otras sedes.

BEGIN;

CREATE TABLE IF NOT EXISTS public.complex_sports (
    complex_id UUID NOT NULL REFERENCES public.complexes(id) ON DELETE CASCADE,
    sport_id UUID NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    PRIMARY KEY (complex_id, sport_id)
);

CREATE INDEX IF NOT EXISTS complex_sports_sport_id_idx
ON public.complex_sports(sport_id);

-- Conserva el comportamiento actual: inicialmente cada complejo dispone
-- del catálogo existente. Luego cada sede puede personalizarlo.
INSERT INTO public.complex_sports (complex_id, sport_id)
SELECT complexes.id, sports.id
FROM public.complexes
CROSS JOIN public.sports
ON CONFLICT (complex_id, sport_id) DO NOTHING;

-- Garantiza también a nivel de base que una cancha no pueda vincularse
-- con un deporte de otra sede.
DO $constraints$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'courts_complex_sport_fkey'
    ) THEN
        ALTER TABLE public.courts
        ADD CONSTRAINT courts_complex_sport_fkey
        FOREIGN KEY (complex_id, sport_id)
        REFERENCES public.complex_sports(complex_id, sport_id)
        ON DELETE RESTRICT;
    END IF;
END;
$constraints$;

GRANT SELECT, INSERT, DELETE
ON public.complex_sports
TO authenticated;

GRANT SELECT
ON public.complex_sports
TO anon;

ALTER TABLE public.complex_sports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS complex_sports_public_select ON public.complex_sports;
DROP POLICY IF EXISTS complex_sports_admin_insert ON public.complex_sports;
DROP POLICY IF EXISTS complex_sports_admin_delete ON public.complex_sports;

CREATE POLICY complex_sports_public_select
ON public.complex_sports
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY complex_sports_admin_insert
ON public.complex_sports
FOR INSERT
TO authenticated
WITH CHECK ((SELECT private.can_manage_complex(complex_id)));

CREATE POLICY complex_sports_admin_delete
ON public.complex_sports
FOR DELETE
TO authenticated
USING ((SELECT private.can_manage_complex(complex_id)));

-- Los administradores pueden crear una disciplina nueva en el catálogo,
-- pero no editar ni eliminar filas globales. Su alcance se controla mediante
-- complex_sports.
DROP POLICY IF EXISTS sports_admin_insert ON public.sports;
CREATE POLICY sports_admin_insert
ON public.sports
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.user_profiles
        WHERE id = (SELECT auth.uid())
          AND role IN ('complex_admin', 'superadmin')
    )
);

COMMIT;
