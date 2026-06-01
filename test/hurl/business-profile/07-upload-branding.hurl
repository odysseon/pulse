# Multi-part Static Assets Stream Upload Processing

# --- Create a business to brand ---
POST {{api_url}}/api/businesses
Authorization: Bearer {{owner_token}}
Content-Type: application/json
{
  "name": "Branding Test Biz {{run_id}}",
  "businessType": "RETAILER"
}
HTTP 201
[Captures]
business_id: jsonpath "$.id"
[Asserts]
jsonpath "$.logoUrl" == null
jsonpath "$.bannerUrl" == null

# --- Upload logo via path-decoupled absolute anchor context ---
POST {{api_url}}/api/businesses/{{business_id}}/logo
Authorization: Bearer {{owner_token}}
[Multipart]
file: file,{{fixtures_dir}}/1000058559.jpg; image/jpeg
HTTP 201
[Captures]
logo_url: jsonpath "$.logoUrl"
[Asserts]
jsonpath "$.logoUrl" isString
jsonpath "$.logoUrl" != null

# --- Upload banner ---
POST {{api_url}}/api/businesses/{{business_id}}/banner
Authorization: Bearer {{owner_token}}
[Multipart]
file: file,{{fixtures_dir}}/1000106287.jpg; image/jpeg
HTTP 201
[Captures]
banner_url: jsonpath "$.bannerUrl"
[Asserts]
jsonpath "$.bannerUrl" isString
jsonpath "$.bannerUrl" != null

# --- Replace logo — new URL must differ from original ---
POST {{api_url}}/api/businesses/{{business_id}}/logo
Authorization: Bearer {{owner_token}}
[Multipart]
file: file,{{fixtures_dir}}/1000106287.jpg; image/jpeg
HTTP 201
[Asserts]
jsonpath "$.logoUrl" isString
jsonpath "$.logoUrl" != "{{logo_url}}"

# --- Intruder cannot upload logo ---
POST {{api_url}}/api/businesses/{{business_id}}/logo
Authorization: Bearer {{intruder_token}}
[Multipart]
file: file,{{fixtures_dir}}/1000058559.jpg; image/jpeg
HTTP 403

# --- Unauthenticated cannot upload ---
POST {{api_url}}/api/businesses/{{business_id}}/logo
[Multipart]
file: file,{{fixtures_dir}}/1000058559.jpg; image/jpeg
HTTP 401

# --- No file uploaded returns 400 ---
POST {{api_url}}/api/businesses/{{business_id}}/logo
Authorization: Bearer {{owner_token}}
Content-Type: application/json
{}
HTTP 400
