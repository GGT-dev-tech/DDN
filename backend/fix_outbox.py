import os

files_to_check = []
for root, _, files in os.walk('.'):
    if '.venv' in root or '.git' in root or '__pycache__' in root:
        continue
    for file in files:
        if file.endswith('.py'):
            files_to_check.append(os.path.join(root, file))

for filepath in files_to_check:
    with open(filepath, 'r') as f:
        content = f.read()
    
    new_content = content
    if 'shared_kernel.outbox.repository' in new_content:
        new_content = new_content.replace('shared_kernel.outbox.repository', 'shared_kernel.outbox.repository')
    
    if 'shared_kernel.outbox.serialization.serializer' in new_content:
        new_content = new_content.replace('shared_kernel.outbox.serialization.serializer', 'shared_kernel.outbox.serialization.serializer')
        
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")
