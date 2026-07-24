CREATE TABLE "admin_audit_logs" (
  "audit_log_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "admin_id" text NOT NULL,
  "admin_name" text NOT NULL,
  "admin_email" text NOT NULL,
  "menu" text NOT NULL,
  "action" text NOT NULL,
  "request_path" text NOT NULL,
  "target_id" text,
  "details" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "ip_address" text,
  "user_agent" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX "admin_audit_logs_created_at_idx"
  ON "admin_audit_logs" ("created_at" DESC);
CREATE INDEX "admin_audit_logs_admin_id_idx"
  ON "admin_audit_logs" ("admin_id");
CREATE INDEX "admin_audit_logs_menu_idx"
  ON "admin_audit_logs" ("menu");

CREATE OR REPLACE FUNCTION prevent_admin_audit_log_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'admin audit logs are immutable';
END;
$$;

CREATE TRIGGER "admin_audit_logs_no_update"
BEFORE UPDATE ON "admin_audit_logs"
FOR EACH ROW EXECUTE FUNCTION prevent_admin_audit_log_mutation();

CREATE TRIGGER "admin_audit_logs_no_delete"
BEFORE DELETE ON "admin_audit_logs"
FOR EACH ROW EXECUTE FUNCTION prevent_admin_audit_log_mutation();

ALTER TABLE "admin_audit_logs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin-audit-logs-anon-no-access"
ON "admin_audit_logs"
AS RESTRICTIVE
FOR ALL
TO "anon"
USING (false)
WITH CHECK (false);

CREATE POLICY "admin-audit-logs-authenticated-no-access"
ON "admin_audit_logs"
AS RESTRICTIVE
FOR ALL
TO "authenticated"
USING (false)
WITH CHECK (false);
