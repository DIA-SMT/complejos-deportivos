-- Branding configurable para convertir el sistema en una base SaaS.
-- Ejecutar en Supabase SQL Editor antes de guardar desde /configuracion.

ALTER TABLE public.complexes
ADD COLUMN IF NOT EXISTS app_name TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS footer_line_1 TEXT,
ADD COLUMN IF NOT EXISTS footer_line_2 TEXT,
ADD COLUMN IF NOT EXISTS assistant_name TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL;

UPDATE public.complexes
SET
    app_name = COALESCE(app_name, 'Complejos Deportivos'),
    logo_url = COALESCE(logo_url, '/logoMuni-sm.png'),
    description = COALESCE(description, 'Sistema de gestion de complejos deportivos'),
    footer_line_1 = COALESCE(footer_line_1, 'Desarrollado por la Direccion de Inteligencia Artificial'),
    footer_line_2 = COALESCE(footer_line_2, 'Municipalidad de San Miguel de Tucuman'),
    assistant_name = COALESCE(assistant_name, 'Migue');

INSERT INTO public.complexes (
    name,
    app_name,
    logo_url,
    description,
    footer_line_1,
    footer_line_2,
    assistant_name
)
SELECT
    'Complejo Deportivo Ledesma',
    'Complejos Deportivos',
    '/logoMuni-sm.png',
    'Sistema de gestion de complejos deportivos',
    'Desarrollado por la Direccion de Inteligencia Artificial',
    'Municipalidad de San Miguel de Tucuman',
    'Migue'
WHERE NOT EXISTS (SELECT 1 FROM public.complexes);
