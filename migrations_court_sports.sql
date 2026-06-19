-- Vinculo explicito entre canchas y deportes.
-- Ejecutar antes de las migraciones de reservas.

ALTER TABLE public.courts
ADD COLUMN IF NOT EXISTS sport_id UUID REFERENCES public.sports(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS courts_sport_id_idx
ON public.courts(sport_id);

UPDATE public.courts
SET sport_id = sports.id
FROM public.sports
WHERE courts.sport_id IS NULL
AND courts.type IS NOT NULL
AND lower(trim(courts.type)) = lower(trim(sports.name));

ALTER TABLE public.reservation_requests
ADD COLUMN IF NOT EXISTS sport_id UUID REFERENCES public.sports(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS reservation_requests_sport_id_idx
ON public.reservation_requests(sport_id);

UPDATE public.reservation_requests
SET sport_id = sports.id
FROM public.sports
WHERE reservation_requests.sport_id IS NULL
AND lower(trim(reservation_requests.sport)) = lower(trim(sports.name));
