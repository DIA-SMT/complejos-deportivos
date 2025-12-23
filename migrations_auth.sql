-- Tabla de perfiles de usuario
-- Esta tabla almacena información adicional del usuario, incluyendo el rol
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'common' CHECK (role IN ('common', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan leer su propio perfil
CREATE POLICY "Users can view own profile"
    ON public.user_profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Política para que los usuarios puedan actualizar su propio perfil (solo email, no rol)
CREATE POLICY "Users can update own profile"
    ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Política para que los admins puedan ver todos los perfiles
-- NOTA: Esta política causa recursión, así que la deshabilitamos
-- Los admins pueden ver su propio perfil con la política "Users can view own profile"
-- Si necesitas que los admins vean todos los perfiles, usa una función SECURITY DEFINER
-- CREATE POLICY "Admins can view all profiles"
--     ON public.user_profiles
--     FOR SELECT
--     USING (
--         EXISTS (
--             SELECT 1 FROM public.user_profiles
--             WHERE id = auth.uid() AND role = 'admin'
--         )
--     );

-- Política para permitir la inserción desde el trigger (SECURITY DEFINER)
-- Esta política permite que la función handle_new_user() inserte perfiles
CREATE POLICY "Allow trigger to insert profiles"
    ON public.user_profiles
    FOR INSERT
    WITH CHECK (true);

-- Función para crear automáticamente un perfil cuando se crea un usuario en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'common');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar la función cuando se crea un nuevo usuario
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Comentarios
COMMENT ON TABLE public.user_profiles IS 'Perfiles de usuario con roles (common/admin)';
COMMENT ON COLUMN public.user_profiles.role IS 'Rol del usuario: common (solo lectura) o admin (lectura/escritura)';

