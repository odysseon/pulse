# Auth validation and collection capturing

# --- Owner login ---
POST {{api_url}}/api/auth/login
Content-Type: application/json
{
  "email": "{{owner_email}}",
  "password": "{{owner_password}}"
}
HTTP 200
[Captures]
owner_token: jsonpath "$.token"
[Asserts]
jsonpath "$.token" isString
jsonpath "$.expiresAt" isString

# --- Intruder login ---
POST {{api_url}}/api/auth/login
Content-Type: application/json
{
  "email": "{{intruder_email}}",
  "password": "{{intruder_password}}"
}
HTTP 200
[Captures]
intruder_token: jsonpath "$.token"
[Asserts]
jsonpath "$.token" isString
