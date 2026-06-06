
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS is_pinned boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS data_saver boolean NOT NULL DEFAULT false;
