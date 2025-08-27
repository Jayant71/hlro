
## Mapbox Cost Implications

| Service          | Free Tier    | Paid Tier        | Rate Limits |
|------------------|--------------|------------------|-------------|
| Directions API   | 100k/mo      | $0.50/1k req     | 600 req/min |
| Geocoding API    | 100k/mo      | $0.75/1k req     | 600 req/min |
| Map Loads        | 50k/mo       | $5/1k loads      | N/A         |

**Example Monthly Cost:**
- 200k Directions: $50
- 200k Geocoding: $75
- 100k Map Loads: $250

**Total for 200k Directions, 200k Geocoding, 100k Map Loads:** ~$375/month

See [Mapbox Pricing](https://www.mapbox.com/pricing/) for latest details.
## Mapbox Usage Costs

This project uses Mapbox APIs for routing, geocoding, and map visualization. Mapbox services are billed based on usage:

- **Directions API**: Charged per request.
- **Geocoding API**: Charged per request.
- **Mapbox GL JS (maps)**: Charged per map load.

Refer to [Mapbox Pricing](https://www.mapbox.com/pricing/) for current rates and free tier details. Ensure your MAPBOX_ACCESS_TOKEN is kept secure and monitor usage to avoid unexpected charges.