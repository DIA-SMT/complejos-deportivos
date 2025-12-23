-- Script para corregir las políticas RLS y eliminar la recursión infinita

-- Eliminar la política problemática que causa recursión
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;

-- La política básica "Users can view own profile" es suficiente
-- Los usuarios pueden ver su propio perfil, y eso incluye a los admins

-- Si necesitas que los admins puedan ver todos los perfiles en el futuro,
-- puedes crear una función SECURITY DEFINER que no cause recursión:
-- 
-- CREATE OR REPLACE FUNCTION public.get_all_profiles()
-- RETURNS TABLE(id UUID, email TEXT, role TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- AS $$
-- BEGIN
--   RETURN QUERY
--   SELECT up.id, up.email, up.role, up.created_at, up.updated_at
--   FROM public.user_profiles up
--   WHERE EXISTS (
--     SELECT 1 FROM public.user_profiles
--     WHERE id = auth.uid() AND role = 'admin'
--   );
-- END;
-- $$;

