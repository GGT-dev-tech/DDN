handler_path = 'modules/quotations/application/event_handlers/quotation_approved_handler.py'
with open(handler_path, 'r') as f:
    content = f.read()

if 'from shared_kernel.events.integration import IntegrationEvent' in content and 'EventMetadata' not in content:
    new_content = content.replace('from shared_kernel.events.integration import IntegrationEvent', 'from shared_kernel.events.integration import IntegrationEvent, EventMetadata')
    with open(handler_path, 'w') as f:
        f.write(new_content)
