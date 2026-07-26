# Contract Bounded Context Checklist

Esta checklist define as restrições arquiteturais para o contexto `Contract`. Antes de concluir qualquer sprint ou funcionalidade no Contract, garanta que os seguintes pontos permanecem verdadeiros.

## Regras de Fronteira

- [x] **Propriedade do Agregado**: O agregado `Contract` possui controle e propriedade integral sobre seus elementos internos (`ContractVersion` e `ContractItemSnapshot`).
- [x] **Ausência de Acoplamento Direto**: Nenhuma Entidade ou Value Object de `Contract` importa módulos, entidades ou serviços de outros Bounded Contexts (ex: `Catalog`, `Quotation`, `Pricing`).
- [x] **Isolamento de ORM**: Nenhum Application Service dentro de `Contract` importa ou acessa diretamente tabelas ORM pertencentes a outro Bounded Context.
- [x] **Isolamento de Banco de Dados (RLS)**: O esquema SQL utiliza Row Level Security (RLS) para isolar as queries a nível de banco de dados, prevenindo vazamento de dados entre Tenants.

## Regras de Comunicação por Eventos

- [x] **Uso do Outbox**: Toda transição de estado significativa ou comunicação externa deve resultar na emissão de um `IntegrationEvent` para o repositório de Outbox.
- [x] **Reatividade**: A inicialização ou evolução do Contrato ocorre através da escuta e processamento assíncrono (ou no mesmo Unit of Work) de eventos emitidos por outros Bounded Contexts, sem necessitar de Gateways/Requests síncronos injetados.
- [x] **Encapsulamento de Eventos (Fatos, não Objetos)**: Nenhum `IntegrationEvent` pode expor entidades internas do Aggregate (ex: enviar `ContractItemSnapshot` instanciado). Os eventos carregam **fatos consumíveis** (ID, payload bruto primário, strings, decibéis, etc.), garantindo que os ouvintes não necessitem importar modelos de `Contract` para deserializar a mensagem.
