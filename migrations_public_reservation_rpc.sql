-- Solicitudes publicas de reserva en una unica transaccion.
-- Ejecutar en Supabase SQL Editor despues de migrations_public_reservations.sql.

CREATE UNIQUE INDEX IF NOT EXISTS reservation_requests_unique_active_slot_idx
ON public.reservation_requests(court_id, preferred_date, preferred_time)
WHERE court_id IS NOT NULL
AND status IN ('pending', 'confirmed');

DROP FUNCTION IF EXISTS public.create_public_reservation_request(
    TEXT,
    TEXT,
    TEXT,
    UUID,
    TEXT,
    UUID,
    DATE,
    TIME,
    TEXT
);

DROP FUNCTION IF EXISTS public.create_public_reservation_request(
    TEXT,
    TEXT,
    TEXT,
    UUID,
    TEXT,
    UUID,
    DATE,
    TIME,
    TEXT,
    UUID
);

CREATE OR REPLACE FUNCTION public.create_public_reservation_request(
    p_full_name TEXT,
    p_phone TEXT,
    p_email TEXT,
    p_complex_id UUID,
    p_sport_id UUID,
    p_court_id UUID,
    p_preferred_date DATE,
    p_preferred_time TIME,
    p_notes TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_full_name TEXT := NULLIF(TRIM(p_full_name), '');
    v_phone TEXT := NULLIF(TRIM(p_phone), '');
    v_email TEXT := NULLIF(TRIM(COALESCE(p_email, '')), '');
    v_sport TEXT;
    v_user_id UUID := auth.uid();
    v_notes TEXT := NULLIF(TRIM(COALESCE(p_notes, '')), '');
    v_complex_id UUID := p_complex_id;
    v_court_complex_id UUID;
    v_court_sport_id UUID;
    v_citizen_id UUID;
    v_request_id UUID;
BEGIN
    IF v_full_name IS NULL OR LENGTH(v_full_name) < 3 OR LENGTH(v_full_name) > 120 THEN
        RAISE EXCEPTION 'Ingresa un nombre valido.';
    END IF;

    IF v_phone IS NULL OR v_phone !~ '^[0-9+()\-\s]{6,30}$' THEN
        RAISE EXCEPTION 'Ingresa un telefono valido.';
    END IF;

    IF v_email IS NOT NULL AND v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
        RAISE EXCEPTION 'Ingresa un email valido.';
    END IF;

    IF p_sport_id IS NULL THEN
        RAISE EXCEPTION 'Selecciona una actividad.';
    END IF;

    SELECT name
    INTO v_sport
    FROM public.sports
    WHERE id = p_sport_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'La actividad seleccionada no existe.';
    END IF;

    IF p_preferred_date < CURRENT_DATE THEN
        RAISE EXCEPTION 'La fecha no puede ser anterior a hoy.';
    END IF;

    IF v_notes IS NOT NULL AND LENGTH(v_notes) > 500 THEN
        RAISE EXCEPTION 'El comentario no puede superar los 500 caracteres.';
    END IF;

    IF v_complex_id IS NOT NULL AND NOT EXISTS (
        SELECT 1
        FROM public.complexes
        WHERE id = v_complex_id
    ) THEN
        RAISE EXCEPTION 'El complejo seleccionado no existe.';
    END IF;

    IF p_court_id IS NOT NULL THEN
        SELECT complex_id, sport_id
        INTO v_court_complex_id, v_court_sport_id
        FROM public.courts
        WHERE id = p_court_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'La cancha seleccionada no existe.';
        END IF;

        IF v_complex_id IS NOT NULL AND v_court_complex_id IS NOT NULL AND v_court_complex_id <> v_complex_id THEN
            RAISE EXCEPTION 'La cancha seleccionada no pertenece al complejo elegido.';
        END IF;

        IF v_court_sport_id IS NULL OR v_court_sport_id <> p_sport_id THEN
            RAISE EXCEPTION 'La cancha seleccionada no corresponde a la actividad elegida.';
        END IF;

        v_complex_id := COALESCE(v_complex_id, v_court_complex_id);

        IF EXISTS (
            SELECT 1
            FROM public.reservation_requests
            WHERE court_id = p_court_id
            AND preferred_date = p_preferred_date
            AND preferred_time = p_preferred_time
            AND status IN ('pending', 'confirmed')
        ) THEN
            RAISE EXCEPTION 'Ese horario ya esta reservado o pendiente de confirmacion.';
        END IF;

        IF EXISTS (
            SELECT 1
            FROM public.shifts
            WHERE court_id = p_court_id
            AND date = p_preferred_date
            AND COALESCE(status, '') <> 'cancelled'
            AND start_time < (p_preferred_time + INTERVAL '1 hour')::time
            AND end_time > p_preferred_time
        ) THEN
            RAISE EXCEPTION 'Ese horario ya esta ocupado.';
        END IF;
    END IF;

    INSERT INTO public.citizens (full_name, phone, email)
    VALUES (v_full_name, v_phone, v_email)
    RETURNING id INTO v_citizen_id;

    INSERT INTO public.reservation_requests (
        user_id,
        citizen_id,
        complex_id,
        sport_id,
        sport,
        court_id,
        preferred_date,
        preferred_time,
        notes,
        status
    )
    VALUES (
        v_user_id,
        v_citizen_id,
        v_complex_id,
        p_sport_id,
        v_sport,
        p_court_id,
        p_preferred_date,
        p_preferred_time,
        v_notes,
        'pending'
    )
    RETURNING id INTO v_request_id;

    RETURN v_request_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_public_reservation_request(
    TEXT,
    TEXT,
    TEXT,
    UUID,
    UUID,
    UUID,
    DATE,
    TIME,
    TEXT
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_public_reservation_request(
    TEXT,
    TEXT,
    TEXT,
    UUID,
    UUID,
    UUID,
    DATE,
    TIME,
    TEXT
) TO anon, authenticated;
