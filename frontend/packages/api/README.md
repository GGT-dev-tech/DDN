# DDN OS - API Data Layer (@repo/api)

Este pacote centraliza os contratos de comunicação com o Backend (FastAPI). Ele exporta as tipagens, SDKs e infraestrutura do React Query.

## Arquitetura (React Query Adapters)

O Orval autogera *hooks* do React Query baseados na especificação OpenAPI, além de *mock data* via MSW. No entanto, é **expressamente proibido** consumir os hooks gerados diretamente nos componentes de UI (`apps/web/src/features/...`).

O fluxo correto na DDN OS exige a criação de **Adapters**.

### Motivação
Se a API mudar de nome (ex: `useGetCompany()` para `useFetchOrganization()`), ou o contrato (payload) mudar de formato, não queremos refatorar dezenas de arquivos de UI. O Adapter absorve essa refatoração, mapeando o modelo do backend (DTO) para o formato que a View espera (ViewModel).

### Fluxo de Dependência

```text
Backend (OpenAPI)
       ↓
@repo/api/src/generated (Hooks do Orval: useGetCompany)
       ↓
@repo/api/src/adapters (CompanyAdapter: Mapeia Entity DTO para ViewModel)
       ↓
apps/web/src/features/... (Consome o Adapter)
```

### Exemplo de Implementação de Adapter

Ao invés de fazer isso na UI:
```tsx
import { useGetCompany } from '@repo/api';
// ❌ ERRADO: Acoplamento direto ao hook gerado!
```

Faça isso:
Crie um Adapter no frontend ou no próprio `@repo/api` (recomendado):

```tsx
// src/adapters/company-adapter.ts
import { useGetCompany } from '../generated/api';

export function useCompanyProfile(id: string) {
  const { data, isLoading, error } = useGetCompany(id);

  // Mapeamento DTO -> ViewModel
  const viewModel = data ? {
    id: data.id,
    displayName: `${data.business_name} (${data.cnpj})`,
    isActive: data.status === 'ACTIVE'
  } : null;

  return { company: viewModel, isLoading, error };
}
```

E na UI:
```tsx
import { useCompanyProfile } from '@repo/api';
// ✅ CORRETO: Desacoplado da infra de rede.
```
