-- Run as the database owner after a backup. Custom app JWTs are NOT Supabase
-- JWTs. Private data is accessible only through the authenticated backend API.
BEGIN;
DO $$
DECLARE table_name text; role_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['User', 'RefreshToken', 'PasswordResetToken', 'Order', 'CartItem', 'Like', 'WishlistItem', 'ActivityLog', 'SeoConfig', 'SeoPage'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC', table_name);
    FOREACH role_name IN ARRAY ARRAY['anon', 'authenticated'] LOOP
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
        EXECUTE format('REVOKE ALL ON TABLE public.%I FROM %I', table_name, role_name);
      END IF;
    END LOOP;
    IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = table_name) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime DROP TABLE public.%I', table_name);
    END IF;
  END LOOP;
END $$;
COMMIT;
