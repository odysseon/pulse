# Store Tour Suite — Setup Business Profile
# ---------------------------------------------------------------------------
# We need a business profile to attach the store tour to.
# ---------------------------------------------------------------------------

POST {{api_url}}/api/businesses
Authorization: Bearer {{owner_token}}
Content-Type: application/json
{
  "name": "Store Tour Setup BP {{run_id}}",
  "description": "Store Tour Setup test profile"
}
HTTP 201
[Captures]
tour_biz_id: jsonpath "$.id"
tour_biz_slug: jsonpath "$.slug"
[Asserts]
jsonpath "$.id" isString
jsonpath "$.name" == "Store Tour Setup BP {{run_id}}"
