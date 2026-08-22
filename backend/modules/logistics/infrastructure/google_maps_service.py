import httpx
from pydantic import BaseModel
from typing import Optional, Tuple
from modules.core.config.settings import settings

class DistanceResult(BaseModel):
    distance_km: float
    duration_mins: float
    origin_address: str
    destination_address: str

class GoogleMapsService:
    def __init__(self):
        self.api_key = settings.app.google_maps_api_key
        self.base_url = "https://maps.googleapis.com/maps/api/distancematrix/json"
        
    async def get_distance(self, origin: str, destination: str) -> Optional[DistanceResult]:
        """
        Calls Google Maps Distance Matrix API.
        If no API key is configured or API fails, returns a mock or None.
        """
        if not self.api_key:
            return DistanceResult(
                distance_km=25.0,  # Mock
                duration_mins=45.0,
                origin_address=origin,
                destination_address=destination
            )
            
        params = {
            "origins": origin,
            "destinations": destination,
            "key": self.api_key,
            "language": "pt-BR"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(self.base_url, params=params)
            
            if response.status_code != 200:
                return None
                
            data = response.json()
            if data.get("status") != "OK":
                return None
                
            elements = data["rows"][0]["elements"]
            if not elements or elements[0]["status"] != "OK":
                return None
                
            element = elements[0]
            # distance in meters
            distance_meters = element["distance"]["value"]
            # duration in seconds
            duration_seconds = element["duration"]["value"]
            
            return DistanceResult(
                distance_km=distance_meters / 1000.0,
                duration_mins=duration_seconds / 60.0,
                origin_address=data["origin_addresses"][0],
                destination_address=data["destination_addresses"][0]
            )
