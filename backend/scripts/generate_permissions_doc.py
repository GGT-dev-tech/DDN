import sys
from pathlib import Path

# Add backend directory to path
BACKEND_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from modules.identity.domain.permissions import PermissionCode

DOCS_DIR = BACKEND_DIR.parent / "docs"
PERMISSIONS_FILE = DOCS_DIR / "permissions.md"

def generate_markdown():
    lines = [
        "# Permission Registry",
        "",
        "This document is auto-generated. Do not edit manually.",
        "",
        "| Permission Code | Description |",
        "|-----------------|-------------|"
    ]
    
    # We will just list the enums. If we had a registry with descriptions, 
    # we could extract them here. For now, we will format the enum name.
    for perm in PermissionCode:
        # A simple description derived from the name
        description = perm.value.replace("_", " ").title()
        lines.append(f"| `{perm.value}` | Allows {description} |")
        
    return "\n".join(lines) + "\n"

def main():
    if not DOCS_DIR.exists():
        DOCS_DIR.mkdir(parents=True)
        
    with open(PERMISSIONS_FILE, "w", encoding="utf-8") as f:
        f.write(generate_markdown())
        
    print(f"Permissions documentation generated at: {PERMISSIONS_FILE.relative_to(BACKEND_DIR.parent)}")

if __name__ == "__main__":
    main()
