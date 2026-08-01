# Comandos (Commands)

Lista de comandos (Intenções do usuário) suportados pelos agregados do sistema. Estes mapeiam diretamente para os Use Cases dos Services.

## 1. Commercial Context

### Comandos de Lead
- **RegisterLead**: Iniciar um Lead.
- **LogLeadActivity**: Registrar ligação/e-mail (transversal).
- **QualifyLead**: Mudar status para qualificado.
- **DisqualifyLead**: Marcar como perdido.
- **ConvertLead**: Transforma Lead em Company (se match der falso) e Opportunity.

### Comandos de Company
- **CreateCompany**: Direto ou vindo de conversão.
- **AddServiceLocation**: Novo endereço de coleta.
- **AddContact**: Novo contato.
- **BlockCompany**: Bloqueio de compliance/financeiro.

### Comandos de Opportunity
- **OpenOpportunity**: Criar oportunidade para Company.
- **MoveOpportunityStage**: Atualizar funil.
- **WinOpportunity**: Marcar ganho (depende de Contract).
- **LoseOpportunity**: Marcar perdido.

## 2. Padrão de Implementação
Todo Command no backend deve ser tipado via Pydantic/Dataclasses e encapsular toda informação necessária para executar a ação no Aggregate. O Endpoint (FastAPI) apenas recebe o JSON, hidrata o Command e passa para o Application Service.
