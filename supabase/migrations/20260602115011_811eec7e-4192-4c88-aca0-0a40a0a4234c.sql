INSERT INTO public.hack_keys (key, label, active) VALUES
  ('Agentx', 'Default', true),
  ('enox', 'Default', true),
  ('AVIATOR-2026', 'Default', true),
  ('Aviatorx788', 'Default', true)
ON CONFLICT (key) DO UPDATE SET active = true;