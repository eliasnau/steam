DROP FUNCTION IF EXISTS nanoid_12();

CREATE OR REPLACE FUNCTION nanoid_12()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  alphabet text := '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  size int := 12;
  id text := '';
  i int;
  random_index int;
BEGIN
  FOR i IN 1..size LOOP
    random_index := floor(random() * length(alphabet))::int + 1;
    id := id || substring(alphabet from random_index for 1);
  END LOOP;
  RETURN id;
END;
$$;
