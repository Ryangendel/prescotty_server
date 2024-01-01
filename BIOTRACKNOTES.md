API endpoint: https://mcp-tracking.nmhealth.org/serverjson.asp

All requests should be sent as raw POST requests.

Every request begins and ends with a language approriate tag. The current iteration of our API is now at 4.0. It is strongly recommended that every application specify this with every request.
{
    "API": "4.0",
    "action": "foo"
}