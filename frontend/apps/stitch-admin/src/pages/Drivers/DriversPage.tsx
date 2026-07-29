import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/components/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../shared/ui/components/Table';
import { Badge } from '../../shared/ui/components/Badge';
import { useListDriversFleetDriversGet } from '../../shared/api/generated/fleet/fleet';

export function DriversPage() {
  const { data: drivers, isLoading, isError } = useListDriversFleetDriversGet();

  if (isLoading) return <div className="p-4">Loading drivers...</div>;
  if (isError) return <div className="p-4 text-red-500">Error loading drivers.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Drivers</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Drivers List</CardTitle>
          <CardDescription>
            Manage and view all registered drivers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>License Number</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                    No drivers found.
                  </TableCell>
                </TableRow>
              ) : (
                drivers?.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell className="font-medium">{driver.name}</TableCell>
                    <TableCell>{driver.license_number}</TableCell>
                    <TableCell>
                      <Badge variant={driver.status === 'AVAILABLE' ? 'default' : 'outline'}>
                        {driver.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
