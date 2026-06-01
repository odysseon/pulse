# Owner Management Context Verification

# --- Get my businesses ---
GET {{api_url}}/api/users/me/businesses
Authorization: Bearer {{owner_token}}
HTTP 200
[Asserts]
jsonpath "$" isCollection

# --- Unauthenticated request rejected ---
GET {{api_url}}/api/users/me/businesses
HTTP 401
