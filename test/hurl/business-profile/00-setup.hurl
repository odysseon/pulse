# Register accounts safely (Idempotent loop)

# --- Register owner ---
POST {{api_url}}/api/accounts/register
Content-Type: application/json
{
  "email": "{{owner_email}}",
  "password": "{{owner_password}}",
  "name": "Test Owner"
}
HTTP *
[Asserts]
status toString matches "^(201|409)$"

# --- Register intruder ---
POST {{api_url}}/api/accounts/register
Content-Type: application/json
{
  "email": "{{intruder_email}}",
  "password": "{{intruder_password}}",
  "name": "Test Intruder"
}
HTTP *
[Asserts]
status toString matches "^(201|409)$"
