import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/components/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../shared/ui/components/Table';
import { Badge } from '../../shared/ui/components/Badge';
import { Button } from '../../shared/ui/components/Button';
import { useListQuotationsApiV1QuotationsGet } from '../../shared/api/generated/quotations/quotations';
import { AddQuotationModal } from './components/AddQuotationModal';

export function QuotationsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { data: quotations, isLoading, isError } = useListQuotationsApiV1QuotationsGet();

  if (isLoading) return <div className="p-4">Loading quotations...</div>;
  if (isError) return <div className="p-4 text-red-500">Error loading quotations.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Quotations</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>Create Quotation</Button>
      </div>

      <AddQuotationModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Commercial Proposals</CardTitle>
          <CardDescription>
            Manage and track all customer quotations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quotation ID</TableHead>
                <TableHead>Company ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Validity</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotations?.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-medium text-xs font-mono">{q.id}</TableCell>
                  <TableCell className="text-xs font-mono text-text-secondary">{q.company_id}</TableCell>
                  <TableCell>
                    <Badge variant={q.status === 'APPROVED' ? 'default' : 'outline'}>
                      {q.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{q.expires_at ? new Date(q.expires_at).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>{q.created_at ? new Date(q.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!quotations?.length && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-text-secondary">
                    No quotations found. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
