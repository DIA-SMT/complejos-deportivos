-- Script para crear perfiles para usuarios existentes que no tienen perfil
-- Ejecutar este script en Supabase SQL Editor si tienes usuarios que fueron creados antes del trigger

INSERT INTO public.user_profiles (id, email, role)
SELECT 
    u.id,
    u.email,
    'common' as role
FROM auth.users u
WHERE u.id NOT IN (SELECT id FROM public.user_profiles)
ON CONFLICT (id) DO NOTHING;

-- Verificar usuarios sin perfil después de ejecutar
SELECT 
    u.id,
    u.email,
    u.created_at as user_created_at,
    CASE 
        WHEN p.id IS NULL THEN 'Sin perfil'
        ELSE 'Con perfil'
    END as profile_status
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

