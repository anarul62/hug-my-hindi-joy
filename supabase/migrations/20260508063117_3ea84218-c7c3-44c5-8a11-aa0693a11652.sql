
CREATE TABLE public.game_rounds (
  id BIGSERIAL PRIMARY KEY,
  phase TEXT NOT NULL CHECK (phase IN ('waiting','flying','crashed')),
  crash_point NUMERIC(6,2) NOT NULL,
  waiting_until TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  crashed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_game_rounds_id_desc ON public.game_rounds (id DESC);
CREATE INDEX idx_game_rounds_crashed ON public.game_rounds (crashed_at DESC) WHERE phase = 'crashed';

ALTER TABLE public.game_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_rounds REPLICA IDENTITY FULL;

CREATE POLICY "Anyone can read rounds"
  ON public.game_rounds FOR SELECT
  USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.game_rounds;

CREATE OR REPLACE FUNCTION public.tick_game()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r public.game_rounds%ROWTYPE;
  elapsed NUMERIC;
  current_mult NUMERIC;
  new_cp NUMERIC;
  rnd NUMERIC;
BEGIN
  SELECT * INTO r FROM public.game_rounds ORDER BY id DESC LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF NOT FOUND THEN
    rnd := random();
    IF rnd < 0.02 THEN
      new_cp := 1.00;
    ELSE
      new_cp := LEAST(30.0, GREATEST(1.00, ROUND((1.0/(1.0 - rnd))::numeric, 2)));
    END IF;
    INSERT INTO public.game_rounds(phase, crash_point, waiting_until)
      VALUES('waiting', new_cp, now() + interval '5 seconds');
    RETURN;
  END IF;

  IF r.phase = 'waiting' AND now() >= r.waiting_until THEN
    UPDATE public.game_rounds SET phase='flying', started_at=now() WHERE id=r.id;
    RETURN;
  END IF;

  IF r.phase = 'flying' AND r.started_at IS NOT NULL THEN
    elapsed := EXTRACT(EPOCH FROM (now() - r.started_at));
    current_mult := exp(0.06 * elapsed);
    IF current_mult >= r.crash_point THEN
      UPDATE public.game_rounds SET phase='crashed', crashed_at=now() WHERE id=r.id;
    END IF;
    RETURN;
  END IF;

  IF r.phase = 'crashed' AND r.crashed_at IS NOT NULL
     AND now() - r.crashed_at >= interval '5 seconds' THEN
    rnd := random();
    IF rnd < 0.02 THEN
      new_cp := 1.00;
    ELSE
      new_cp := LEAST(30.0, GREATEST(1.00, ROUND((1.0/(1.0 - rnd))::numeric, 2)));
    END IF;
    INSERT INTO public.game_rounds(phase, crash_point, waiting_until)
      VALUES('waiting', new_cp, now() + interval '5 seconds');
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.tick_game() TO anon, authenticated;

-- Schedule pg_cron tick every 1 second if pg_cron available
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('tick-game-1s', '1 seconds', $$ SELECT public.tick_game(); $$);
