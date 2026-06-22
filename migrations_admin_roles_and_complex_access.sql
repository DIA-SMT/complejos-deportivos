-- Roles administrativos y aislamiento por complejo.
-- Ejecutar una sola vez en Supabase SQL Editor.

BEGIN;

DO $preflight$
BEGIN
    IF to_regclass('public.user_profiles') IS NULL THEN
        RAISE EXCEPTION 'Falta public.user_profiles. Ejecuta primero migrations_auth.sql.';
    END IF;

    IF to_regclass('public.complexes') IS NULL THEN
        RAISE EXCEPTION 'Falta public.complexes. Ejecuta primero la migracion de complejos.';
    END IF;
END;
$preflight$;

ALTER TABLE public.user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_role_check;

UPDATE public.user_profiles
SET role = 'superadmin'
WHERE role = 'admin';

ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_role_check
CHECK (role IN ('common', 'complex_admin', 'superadmin'));

CREATE TABLE IF NOT EXISTS public.complex_admins (
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    complex_id UUID NOT NULL REFERENCES public.complexes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    PRIMARY KEY (user_id, complex_id)
);

CREATE INDEX IF NOT EXISTS complex_admins_complex_id_idx
ON public.complex_admins(complex_id);

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.complex_admins
TO authenticated;

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.is_superadmin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_profiles
        WHERE id = (SELECT auth.uid())
          AND role = 'superadmin'
    );
$$;

CREATE OR REPLACE FUNCTION private.can_manage_complex(p_complex_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
    SELECT
        private.is_superadmin()
        OR EXISTS (
            SELECT 1
            FROM public.complex_admins
            WHERE user_id = (SELECT auth.uid())
              AND complex_id = p_complex_id
        );
$$;

REVOKE ALL ON FUNCTION private.is_superadmin() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.can_manage_complex(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_superadmin() TO authenticated;
GRANT EXECUTE ON FUNCTION private.can_manage_complex(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.find_user_profile_for_complex(
    p_email TEXT,
    p_complex_id UUID
)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, private
AS $$
    SELECT id
    FROM public.user_profiles
    WHERE private.can_manage_complex(p_complex_id)
      AND lower(email) = lower(trim(p_email))
    LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.find_user_profile_for_complex(TEXT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.find_user_profile_for_complex(TEXT, UUID) TO authenticated;

DO $cleanup$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN (
              'user_profiles', 'complexes', 'sports', 'courts',
              'professors', 'professor_schedules', 'inventory', 'shifts',
              'members', 'member_credentials', 'membership_requests',
              'reservation_requests', 'class_reviews'
          )
          AND (cmd <> 'SELECT' OR tablename IN ('inventory', 'class_reviews'))
    LOOP
        EXECUTE format(
            'DROP POLICY IF EXISTS %I ON %I.%I',
            policy_record.policyname,
            policy_record.schemaname,
            policy_record.tablename
        );
    END LOOP;
END;
$cleanup$;

ALTER TABLE public.complex_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complexes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS complex_admins_superadmin_all ON public.complex_admins;
DROP POLICY IF EXISTS complex_admins_user_select_own ON public.complex_admins;

CREATE POLICY complex_admins_superadmin_all
ON public.complex_admins
FOR ALL
TO authenticated
USING ((SELECT private.is_superadmin()))
WITH CHECK ((SELECT private.is_superadmin()));

CREATE POLICY complex_admins_user_select_own
ON public.complex_admins
FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- Un usuario puede leer su perfil, pero no editar su rol desde la API.
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS user_profiles_superadmin_select ON public.user_profiles;
DROP POLICY IF EXISTS user_profiles_superadmin_update ON public.user_profiles;

CREATE POLICY "Users can view own profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (id = (SELECT auth.uid()));

CREATE POLICY user_profiles_superadmin_select
ON public.user_profiles
FOR SELECT
TO authenticated
USING ((SELECT private.is_superadmin()));

CREATE POLICY user_profiles_superadmin_update
ON public.user_profiles
FOR UPDATE
TO authenticated
USING ((SELECT private.is_superadmin()))
WITH CHECK ((SELECT private.is_superadmin()));

DROP POLICY IF EXISTS user_profiles_insert_own_common ON public.user_profiles;
CREATE POLICY user_profiles_insert_own_common
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (
    id = (SELECT auth.uid())
    AND role = 'common'
);

-- Complejos: lectura pública; sólo superadmin crea o elimina.
DROP POLICY IF EXISTS complexes_superadmin_insert ON public.complexes;
DROP POLICY IF EXISTS complexes_admin_update ON public.complexes;
DROP POLICY IF EXISTS complexes_superadmin_delete ON public.complexes;

CREATE POLICY complexes_superadmin_insert
ON public.complexes
FOR INSERT
TO authenticated
WITH CHECK ((SELECT private.is_superadmin()));

CREATE POLICY complexes_admin_update
ON public.complexes
FOR UPDATE
TO authenticated
USING ((SELECT private.can_manage_complex(id)))
WITH CHECK ((SELECT private.can_manage_complex(id)));

CREATE POLICY complexes_superadmin_delete
ON public.complexes
FOR DELETE
TO authenticated
USING ((SELECT private.is_superadmin()));

DROP POLICY IF EXISTS complexes_public_select_policy ON public.complexes;
CREATE POLICY complexes_public_select_policy
ON public.complexes
FOR SELECT
TO anon, authenticated
USING (true);

-- Deportes son catálogo global: sólo superadmin los modifica.
DROP POLICY IF EXISTS "sports_insert_policy" ON public.sports;
DROP POLICY IF EXISTS "sports_update_policy" ON public.sports;
DROP POLICY IF EXISTS "sports_delete_policy" ON public.sports;
DROP POLICY IF EXISTS sports_superadmin_insert ON public.sports;
DROP POLICY IF EXISTS sports_superadmin_update ON public.sports;
DROP POLICY IF EXISTS sports_superadmin_delete ON public.sports;

CREATE POLICY sports_superadmin_insert
ON public.sports FOR INSERT TO authenticated
WITH CHECK ((SELECT private.is_superadmin()));

CREATE POLICY sports_superadmin_update
ON public.sports FOR UPDATE TO authenticated
USING ((SELECT private.is_superadmin()))
WITH CHECK ((SELECT private.is_superadmin()));

CREATE POLICY sports_superadmin_delete
ON public.sports FOR DELETE TO authenticated
USING ((SELECT private.is_superadmin()));

DROP POLICY IF EXISTS sports_select_policy ON public.sports;
CREATE POLICY sports_select_policy
ON public.sports
FOR SELECT
TO anon, authenticated
USING (true);

-- Canchas.
DROP POLICY IF EXISTS "courts_insert_policy" ON public.courts;
DROP POLICY IF EXISTS "courts_update_policy" ON public.courts;
DROP POLICY IF EXISTS "courts_delete_policy" ON public.courts;
DROP POLICY IF EXISTS courts_admin_insert ON public.courts;
DROP POLICY IF EXISTS courts_admin_update ON public.courts;
DROP POLICY IF EXISTS courts_admin_delete ON public.courts;

CREATE POLICY courts_admin_insert
ON public.courts FOR INSERT TO authenticated
WITH CHECK ((SELECT private.can_manage_complex(complex_id)));

CREATE POLICY courts_admin_update
ON public.courts FOR UPDATE TO authenticated
USING ((SELECT private.can_manage_complex(complex_id)))
WITH CHECK ((SELECT private.can_manage_complex(complex_id)));

CREATE POLICY courts_admin_delete
ON public.courts FOR DELETE TO authenticated
USING ((SELECT private.can_manage_complex(complex_id)));

DROP POLICY IF EXISTS courts_select_policy ON public.courts;
CREATE POLICY courts_select_policy
ON public.courts
FOR SELECT
TO anon, authenticated
USING (true);

-- Tablas operativas con complex_id.
ALTER TABLE public.professors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "professors_insert_policy" ON public.professors;
DROP POLICY IF EXISTS "professors_update_policy" ON public.professors;
DROP POLICY IF EXISTS "professors_delete_policy" ON public.professors;
DROP POLICY IF EXISTS professors_admin_all ON public.professors;
CREATE POLICY professors_admin_all ON public.professors
FOR ALL TO authenticated
USING ((SELECT private.can_manage_complex(complex_id)))
WITH CHECK ((SELECT private.can_manage_complex(complex_id)));

DROP POLICY IF EXISTS "professor_schedules_insert_policy" ON public.professor_schedules;
DROP POLICY IF EXISTS "professor_schedules_update_policy" ON public.professor_schedules;
DROP POLICY IF EXISTS "professor_schedules_delete_policy" ON public.professor_schedules;
DROP POLICY IF EXISTS professor_schedules_admin_all ON public.professor_schedules;
CREATE POLICY professor_schedules_admin_all ON public.professor_schedules
FOR ALL TO authenticated
USING ((SELECT private.can_manage_complex(complex_id)))
WITH CHECK ((SELECT private.can_manage_complex(complex_id)));

DROP POLICY IF EXISTS inventory_admin_all ON public.inventory;
CREATE POLICY inventory_admin_all ON public.inventory
FOR ALL TO authenticated
USING ((SELECT private.can_manage_complex(complex_id)))
WITH CHECK ((SELECT private.can_manage_complex(complex_id)));

DROP POLICY IF EXISTS shifts_authenticated_all ON public.shifts;
DROP POLICY IF EXISTS shifts_admin_all ON public.shifts;
CREATE POLICY shifts_admin_all ON public.shifts
FOR ALL TO authenticated
USING ((SELECT private.can_manage_complex(complex_id)))
WITH CHECK ((SELECT private.can_manage_complex(complex_id)));

-- Socios y solicitudes.
DROP POLICY IF EXISTS "members_admin_all_policy" ON public.members;
DROP POLICY IF EXISTS members_complex_admin_all ON public.members;
CREATE POLICY members_complex_admin_all ON public.members
FOR ALL TO authenticated
USING ((SELECT private.can_manage_complex(complex_id)))
WITH CHECK ((SELECT private.can_manage_complex(complex_id)));

DROP POLICY IF EXISTS "member_credentials_admin_all_policy" ON public.member_credentials;
DROP POLICY IF EXISTS member_credentials_complex_admin_all ON public.member_credentials;
CREATE POLICY member_credentials_complex_admin_all ON public.member_credentials
FOR ALL TO authenticated
USING ((SELECT private.can_manage_complex(complex_id)))
WITH CHECK ((SELECT private.can_manage_complex(complex_id)));

DROP POLICY IF EXISTS "membership_requests_admin_all_policy" ON public.membership_requests;
DROP POLICY IF EXISTS membership_requests_complex_admin_all ON public.membership_requests;
CREATE POLICY membership_requests_complex_admin_all ON public.membership_requests
FOR ALL TO authenticated
USING ((SELECT private.can_manage_complex(complex_id)))
WITH CHECK ((SELECT private.can_manage_complex(complex_id)));

DROP POLICY IF EXISTS membership_requests_user_insert_policy ON public.membership_requests;
CREATE POLICY membership_requests_user_insert_policy
ON public.membership_requests
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = (SELECT auth.uid())
    AND lower(email) = lower((SELECT auth.jwt()) ->> 'email')
);

DROP POLICY IF EXISTS "reservation_requests_admin_select_policy" ON public.reservation_requests;
DROP POLICY IF EXISTS "reservation_requests_admin_update_policy" ON public.reservation_requests;
DROP POLICY IF EXISTS reservation_requests_complex_admin_select ON public.reservation_requests;
DROP POLICY IF EXISTS reservation_requests_complex_admin_update ON public.reservation_requests;

CREATE POLICY reservation_requests_complex_admin_select
ON public.reservation_requests
FOR SELECT TO authenticated
USING ((SELECT private.can_manage_complex(complex_id)));

CREATE POLICY reservation_requests_complex_admin_update
ON public.reservation_requests
FOR UPDATE TO authenticated
USING ((SELECT private.can_manage_complex(complex_id)))
WITH CHECK ((SELECT private.can_manage_complex(complex_id)));

DROP POLICY IF EXISTS "citizens_admin_select_policy" ON public.citizens;
DROP POLICY IF EXISTS citizens_complex_admin_select ON public.citizens;
CREATE POLICY citizens_complex_admin_select
ON public.citizens
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.reservation_requests
        WHERE reservation_requests.citizen_id = citizens.id
          AND (SELECT private.can_manage_complex(reservation_requests.complex_id))
    )
);

-- Reportes, autorizados según el complejo del horario.
ALTER TABLE public.class_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS class_reviews_admin_all ON public.class_reviews;
CREATE POLICY class_reviews_admin_all
ON public.class_reviews
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.professor_schedules
        WHERE professor_schedules.id = class_reviews.schedule_id
          AND (SELECT private.can_manage_complex(professor_schedules.complex_id))
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.professor_schedules
        WHERE professor_schedules.id = class_reviews.schedule_id
          AND (SELECT private.can_manage_complex(professor_schedules.complex_id))
    )
);

-- La aprobación debe respetar el complejo asignado.
CREATE OR REPLACE FUNCTION public.approve_membership_request(
    p_request_id UUID,
    p_expires_at DATE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, private
AS $$
DECLARE
    v_request public.membership_requests%ROWTYPE;
    v_member_id UUID;
    v_credential_id UUID;
    v_code TEXT;
BEGIN
    SELECT *
    INTO v_request
    FROM public.membership_requests
    WHERE id = p_request_id
      AND status = 'pending'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'La solicitud no existe o ya fue procesada.';
    END IF;

    IF NOT private.can_manage_complex(v_request.complex_id) THEN
        RAISE EXCEPTION 'No tenes permisos para administrar este complejo.';
    END IF;

    IF p_expires_at IS NULL OR p_expires_at < CURRENT_DATE THEN
        RAISE EXCEPTION 'La fecha de vencimiento no puede ser anterior a hoy.';
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.members
        WHERE complex_id = v_request.complex_id
          AND dni = v_request.dni
    ) THEN
        RAISE EXCEPTION 'Ya existe un socio con ese DNI en este complejo.';
    END IF;

    INSERT INTO public.members (
        user_id, complex_id, first_name, last_name, dni, phone, email, status, notes
    ) VALUES (
        v_request.user_id, v_request.complex_id, v_request.first_name,
        v_request.last_name, v_request.dni, v_request.phone,
        lower(v_request.email), 'active', v_request.notes
    )
    RETURNING id INTO v_member_id;

    v_code := 'CRED-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

    INSERT INTO public.member_credentials (
        member_id, complex_id, code, membership_type,
        enabled_activities, expires_at, status
    ) VALUES (
        v_member_id, v_request.complex_id, v_code,
        v_request.requested_membership_type, v_request.requested_activities,
        p_expires_at, 'active'
    )
    RETURNING id INTO v_credential_id;

    UPDATE public.membership_requests
    SET status = 'approved', updated_at = NOW()
    WHERE id = v_request.id;

    RETURN v_credential_id;
END;
$$;

REVOKE ALL ON FUNCTION public.approve_membership_request(UUID, DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_membership_request(UUID, DATE) TO authenticated;

COMMIT;

-- Verificación: todas las columnas deben devolver true.
SELECT
    to_regclass('public.complex_admins') IS NOT NULL AS complex_admins_creada,
    to_regprocedure('private.is_superadmin()') IS NOT NULL AS funcion_superadmin_creada,
    to_regprocedure('private.can_manage_complex(uuid)') IS NOT NULL AS funcion_acceso_creada,
    to_regprocedure('public.find_user_profile_for_complex(text,uuid)') IS NOT NULL AS funcion_busqueda_creada,
    (
        SELECT relrowsecurity
        FROM pg_class
        WHERE oid = 'public.complex_admins'::regclass
    ) AS rls_asignaciones_activo,
    EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'complex_admins'
          AND policyname = 'complex_admins_superadmin_all'
    ) AS politica_superadmin_creada,
    NOT EXISTS (
        SELECT 1
        FROM public.user_profiles
        WHERE role = 'admin'
    ) AS roles_antiguos_migrados;
