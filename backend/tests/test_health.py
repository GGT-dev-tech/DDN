from fastapi.testclient import TestClient

from apps.api_gateway.src.main import app

client = TestClient(app)

def test_health_live():
    response = client.get("/health/live")
    assert response.status_code == 200
    assert response.json() == {"status": "alive"}

def test_health_startup():
    response = client.get("/health/startup")
    assert response.status_code == 200
    assert response.json() == {"status": "started"}

# health_ready depends on the real database, so it may fail if db is not up.
# This test validates the structure of the response and handles both 200/503.
def test_health_ready():
    response = client.get("/health/ready")
    assert response.status_code in [200, 503]
    json_data = response.json()
    assert "status" in json_data
    assert "dependencies" in json_data
    assert "postgres" in json_data["dependencies"]
    assert "redis" in json_data["dependencies"]
