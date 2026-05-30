-- Seed initial data (idempotent)

INSERT INTO "site_settings" ("key", "value")
VALUES ('wa_number', '628953919161725')
ON CONFLICT ("key") DO NOTHING;
