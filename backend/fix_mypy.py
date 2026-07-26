import os

files_to_fix = [
    'shared_kernel/policies/base.py',
    'shared_kernel/outbox/repository.py',
    'shared_kernel/outbox/serialization/serializer.py',
]

for filepath in files_to_fix:
    with open(filepath, 'r') as f:
        content = f.read()
    
    new_content = content.replace('DomainEvent', 'IntegrationEvent')
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

# For quotation_approved_handler.py
handler_path = 'modules/quotations/application/event_handlers/quotation_approved_handler.py'
with open(handler_path, 'r') as f:
    content = f.read()
    
new_content = content.replace('QuotationApprovedIntegrationEvent(', 'QuotationApprovedIntegrationEvent(\n            metadata=event.metadata,')
new_content = new_content.replace('await self.outbox_repository.save(integration_event)', 'self.outbox_repository.save(integration_event)')

if new_content != content:
    with open(handler_path, 'w') as f:
        f.write(new_content)
    print(f"Updated {handler_path}")

