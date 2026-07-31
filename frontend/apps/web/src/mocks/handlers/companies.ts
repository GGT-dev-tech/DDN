import { http, HttpResponse } from 'msw';

// Tipos base para o mock
interface Company {
  id: string;
  trade_name: string;
  corporate_name: string;
  document_number: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const companiesMock: Company[] = [
  {
    id: 'c1b487d6-3e05-4c0a-9d90-867c295b9a4c',
    trade_name: 'Tech Corp',
    corporate_name: 'Tech Corporation Ltda',
    document_number: '12.345.678/0001-90',
    status: 'ACTIVE',
  },
  {
    id: 'f930e447-66a9-4b2a-8959-15886a117565',
    trade_name: 'Green Waste Solutions',
    corporate_name: 'Green Waste Solutions S.A.',
    document_number: '98.765.432/0001-10',
    status: 'ACTIVE',
  },
  {
    id: '205cf1b4-7ea6-42fc-8e4d-6298533b3a77',
    trade_name: 'Logistics Alpha',
    corporate_name: 'Logistics Alpha Transportes',
    document_number: '44.555.666/0001-22',
    status: 'INACTIVE',
  },
];

export const companiesHandlers = [
  // GET /api/v1/commercial/companies
  http.get('*/api/v1/commercial/companies', () => {
    return HttpResponse.json(companiesMock);
  }),

  // POST /api/v1/commercial/companies (Mock for creation)
  http.post('*/api/v1/commercial/companies', async ({ request }) => {
    const data = (await request.json()) as Omit<Company, 'id'>;
    const newCompany: Company = {
      id: crypto.randomUUID(),
      ...data,
      status: 'ACTIVE',
    };
    companiesMock.push(newCompany);
    return HttpResponse.json(newCompany, { status: 201 });
  }),
];
