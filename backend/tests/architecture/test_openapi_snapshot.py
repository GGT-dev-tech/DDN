import json
import sys
from pathlib import Path

import pytest

BACKEND_DIR = Path(__file__).parent.parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from fastapi.testclient import TestClient

from apps.api_gateway.src.main import app

SNAPSHOT_DIR = Path(__file__).parent / "snapshots"
SNAPSHOT_FILE = SNAPSHOT_DIR / "openapi_v1.json"

@pytest.fixture
def client():
    return TestClient(app)

def is_breaking_change(old_spec: dict, new_spec: dict) -> list:
    """
    Very naive breaking change detector for demonstration.
    In a real-world scenario, you might use 'openapi-diff' or a more robust library.
    We check if any paths were removed or if any HTTP methods were removed.
    """
    violations = []
    old_paths = old_spec.get("paths", {})
    new_paths = new_spec.get("paths", {})
    
    for path, methods in old_paths.items():
        if path not in new_paths:
            violations.append(f"Breaking Change: Path '{path}' was removed.")
            continue
            
        for method in methods.keys():
            if method not in new_paths[path]:
                violations.append(f"Breaking Change: Method '{method.upper()}' was removed from path '{path}'.")
                
    # Also check if any required parameters were added to existing endpoints
    # This is a simplified check
    return violations

def test_openapi_snapshot(client):
    """
    Ensures that changes to the OpenAPI spec are intentional and do not contain 
    unintended breaking changes.
    """
    response = client.get("/openapi.json")
    assert response.status_code == 200
    
    new_spec = response.json()
    
    if not SNAPSHOT_DIR.exists():
        SNAPSHOT_DIR.mkdir(parents=True)
        
    # If there is no snapshot, we generate the first one
    if not SNAPSHOT_FILE.exists():
        with open(SNAPSHOT_FILE, "w", encoding="utf-8") as f:
            json.dump(new_spec, f, indent=2)
        pytest.skip("OpenAPI snapshot created. Run the test again to verify against it.")
        
    with open(SNAPSHOT_FILE, "r", encoding="utf-8") as f:
        old_spec = json.load(f)
        
    violations = is_breaking_change(old_spec, new_spec)
    assert not violations, "OpenAPI Breaking Changes Detected:\n" + "\n".join(violations)
    
    # If we want to strictly match the snapshot to prevent ANY unreviewed change:
    # assert old_spec == new_spec, "OpenAPI spec changed! Please review the changes and update the snapshot."
