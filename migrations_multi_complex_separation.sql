-- Separacion inicial de datos por complejo.
-- Ejecutar en Supabase SQL Editor.
-- Asigna los datos existentes al primer complejo creado, que hoy representa la instancia actual (Ledesma).

ALTER TABLE public.professors
ADD COLUMN IF NOT EXISTS complex_id UUID REFERENCES public.complexes(id) ON DELETE SET NULL;

ALTER TABLE public.professor_schedules
ADD COLUMN IF NOT EXISTS complex_id UUID REFERENCES public.complexes(id) ON DELETE SET NULL;

ALTER TABLE public.inventory
ADD COLUMN IF NOT EXISTS complex_id UUID REFERENCES public.complexes(id) ON DELETE SET NULL;

ALTER TABLE public.shifts
ADD COLUMN IF NOT EXISTS complex_id UUID REFERENCES public.complexes(id) ON DELETE SET NULL;

WITH active_complex AS (
    SELECT id
    FROM public.complexes
    ORDER BY created_at ASC
    LIMIT 1
)
UPDATE public.professors
SET complex_id = (SELECT id FROM active_complex)
WHERE complex_id IS NULL;

WITH active_complex AS (
    SELECT id
    FROM public.complexes
    ORDER BY created_at ASC
    LIMIT 1
)
UPDATE public.professor_schedules
SET complex_id = COALESCE(
    (
        SELECT professors.complex_id
        FROM public.professors
        WHERE professors.id = professor_schedules.professor_id
    ),
    (SELECT id FROM active_complex)
)
WHERE complex_id IS NULL;

WITH active_complex AS (
    SELECT id
    FROM public.complexes
    ORDER BY created_at ASC
    LIMIT 1
)
UPDATE public.inventory
SET complex_id = (SELECT id FROM active_complex)
WHERE complex_id IS NULL;

WITH active_complex AS (
    SELECT id
    FROM public.complexes
    ORDER BY created_at ASC
    LIMIT 1
)
UPDATE public.shifts
SET complex_id = COALESCE(
    (
        SELECT courts.complex_id
        FROM public.courts
        WHERE courts.id = shifts.court_id
    ),
    (
        SELECT professors.complex_id
        FROM public.professors
        WHERE professors.id = shifts.professor_id
    ),
    (SELECT id FROM active_complex)
)
WHERE complex_id IS NULL;

CREATE INDEX IF NOT EXISTS professors_complex_id_idx
ON public.professors(complex_id);

CREATE INDEX IF NOT EXISTS professor_schedules_complex_id_idx
ON public.professor_schedules(complex_id);

CREATE INDEX IF NOT EXISTS inventory_complex_id_idx
ON public.inventory(complex_id);

CREATE INDEX IF NOT EXISTS shifts_complex_id_idx
ON public.shifts(complex_id);
