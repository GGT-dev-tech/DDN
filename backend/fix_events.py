import os
import glob

# Search in modules, shared_kernel, tests
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
    
    if 'shared_kernel.events.integration' in content or 'shared_kernel.events.integration' in content or 'IntegrationEvent' in content or 'DomainEvent' in content:
        # We need to change the import
        new_content = content.replace('shared_kernel.events.integration', 'shared_kernel.events.integration')
        
        # If it imports DomainEvent from integration, it should import IntegrationEvent
        # Instead of generic text replace, we do specific regex/replacements
        if 'shared_kernel.events.integration' in new_content and 'DomainEvent' in new_content:
            new_content = new_content.replace('from shared_kernel.events.integration import IntegrationEvent', 'from shared_kernel.events.integration import IntegrationEvent')
            new_content = new_content.replace('import IntegrationEvent, EventMetadata', 'import IntegrationEvent, EventMetadata')
            new_content = new_content.replace('IntegrationEvent, EventMetadata', 'IntegrationEvent, EventMetadata')
            new_content = new_content.replace('class ContractActivatedIntegrationEvent(IntegrationEvent):', 'class ContractActivatedIntegrationEvent(IntegrationEvent):')
            new_content = new_content.replace('class QuotationApprovedIntegrationEvent(IntegrationEvent):', 'class QuotationApprovedIntegrationEvent(IntegrationEvent):')
            
            # Change type hints for Integration Events
            new_content = new_content.replace('def get_all(self) -> list[IntegrationEvent]:', 'def get_all(self) -> list[IntegrationEvent]:')
            new_content = new_content.replace('def save(self, event: IntegrationEvent) -> None:', 'def save(self, event: IntegrationEvent) -> None:')
            new_content = new_content.replace('def serialize(self, event: IntegrationEvent) -> dict[str, Any]:', 'def serialize(self, event: IntegrationEvent) -> dict[str, Any]:')
            new_content = new_content.replace('def deserialize(self, data: dict[str, Any]) -> IntegrationEvent:', 'def deserialize(self, data: dict[str, Any]) -> IntegrationEvent:')
            new_content = new_content.replace('event: IntegrationEvent,', 'event: IntegrationEvent,')

        if new_content != content:
            with open(filepath, 'w') as f:
                f.write(new_content)
            print(f"Updated {filepath}")
