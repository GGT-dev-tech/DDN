import os
import ast
import json

def analyze_module(module_path):
    result = {
        "domain": {"entities": [], "value_objects": []},
        "application": {"services": [], "use_cases": [], "dtos": []},
        "infrastructure": {"repositories": [], "orm_models": []},
        "presentation": {"routes": []}
    }
    
    for root, _, files in os.walk(module_path):
        for file in files:
            if not file.endswith('.py'): continue
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    tree = ast.parse(f.read())
            except Exception:
                continue
                
            classes = [node.name for node in ast.walk(tree) if isinstance(node, ast.ClassDef)]
            functions = [node.name for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]
            
            if 'domain/entities' in file_path or 'domain/models' in file_path:
                result["domain"]["entities"].extend(classes)
            elif 'domain/value_objects' in file_path:
                result["domain"]["value_objects"].extend(classes)
            elif 'application/services' in file_path:
                result["application"]["services"].extend(classes)
            elif 'application/use_cases' in file_path:
                result["application"]["use_cases"].extend(classes)
            elif 'application/dto' in file_path:
                result["application"]["dtos"].extend(classes)
            elif 'infrastructure/repositories' in file_path:
                result["infrastructure"]["repositories"].extend(classes)
            elif 'infrastructure/orm_models' in file_path or 'infrastructure/models' in file_path:
                result["infrastructure"]["orm_models"].extend(classes)
            elif 'presentation/routes' in file_path or 'presentation/controllers' in file_path:
                routes = [f for f in functions if not f.startswith('_')]
                result["presentation"]["routes"].extend(routes)
    
    return result

backend_dir = os.path.join(os.getcwd(), 'modules')
analysis = {}
if os.path.exists(backend_dir):
    for module_name in os.listdir(backend_dir):
        module_path = os.path.join(backend_dir, module_name)
        if os.path.isdir(module_path) and module_name != '__pycache__':
            analysis[module_name] = analyze_module(module_path)

print(json.dumps(analysis, indent=2))
