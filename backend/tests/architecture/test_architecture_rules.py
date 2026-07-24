import os
import ast
import pytest
from pathlib import Path

BACKEND_DIR = Path(__file__).parent.parent.parent

def iter_python_files(directory):
    for root, _, files in os.walk(directory):
        if ".venv" in root or "__pycache__" in root:
            continue
        for f in files:
            if f.endswith(".py"):
                yield Path(root) / f

def test_no_uuid4_usage():
    """
    Ensures that uuid.uuid4() is not used anywhere in the codebase.
    UUIDv7 must be used instead (uuid6.uuid7).
    """
    violations = []
    for filepath in iter_python_files(BACKEND_DIR):
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        try:
            tree = ast.parse(content, filename=str(filepath))
        except SyntaxError:
            continue
            
        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                # Check for uuid.uuid4()
                if isinstance(node.func, ast.Attribute):
                    if getattr(node.func.value, "id", None) == "uuid" and node.func.attr == "uuid4":
                        violations.append(f"{filepath.relative_to(BACKEND_DIR)}:{node.lineno} uses uuid.uuid4()")
                # Check for just uuid4()
                elif isinstance(node.func, ast.Name):
                    if node.func.id == "uuid4":
                        violations.append(f"{filepath.relative_to(BACKEND_DIR)}:{node.lineno} uses uuid4()")

    assert not violations, "Found uuid4() usages:\n" + "\n".join(violations)

def test_domain_layer_independence():
    """
    Ensures that domain layers do not import fastapi, sqlalchemy, or pydantic.
    """
    violations = []
    for filepath in iter_python_files(BACKEND_DIR / "modules"):
        if "domain" not in filepath.parts:
            continue
            
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            
        try:
            tree = ast.parse(content, filename=str(filepath))
        except SyntaxError:
            continue
            
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    if alias.name.startswith(("fastapi", "sqlalchemy", "pydantic")):
                        # Exceptions for legacy structure
                        if alias.name.startswith("sqlalchemy") and "entities" in filepath.parts:
                            continue
                        if alias.name.startswith("pydantic") and filepath.name == "dto.py":
                            continue
                        violations.append(f"{filepath.relative_to(BACKEND_DIR)}:{node.lineno} imports {alias.name}")
            elif isinstance(node, ast.ImportFrom):
                if node.module and node.module.startswith(("fastapi", "sqlalchemy", "pydantic")):
                    if node.module.startswith("sqlalchemy") and "entities" in filepath.parts:
                        continue
                    if node.module.startswith("pydantic") and filepath.name == "dto.py":
                        continue
                    violations.append(f"{filepath.relative_to(BACKEND_DIR)}:{node.lineno} imports from {node.module}")
                    
    assert not violations, "Domain layer contains forbidden imports:\n" + "\n".join(violations)

def test_repository_does_not_publish_events():
    """
    Ensures that classes ending in 'Repository' do not call 'publish' on an EventBus.
    """
    violations = []
    for filepath in iter_python_files(BACKEND_DIR / "modules"):
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            
        try:
            tree = ast.parse(content, filename=str(filepath))
        except SyntaxError:
            continue
            
        for class_node in [n for n in ast.walk(tree) if isinstance(n, ast.ClassDef)]:
            if not class_node.name.endswith("Repository"):
                continue
                
            for node in ast.walk(class_node):
                if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute):
                    if node.func.attr == "publish":
                        violations.append(f"{filepath.relative_to(BACKEND_DIR)}:{node.lineno} Repository '{class_node.name}' calls publish()")
                        
    assert not violations, "Repositories must not publish events:\n" + "\n".join(violations)
