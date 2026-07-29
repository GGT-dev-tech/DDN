import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/components/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../shared/ui/components/Table';
import { Badge } from '../../shared/ui/components/Badge';
import { useListRoutesRoutingRoutesGet } from '../../shared/api/generated/routing/routing';

export function RoutesPage() {
  const { data: routes, isLoading, isError } = useListRoutesRoutingRoutesGet();

  if (isLoading) return <div className="p-4">Loading routes...</div>;
  if (isError) return <div className="p-4 text-red-500">Error loading routes.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Routes</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Active Routes</CardTitle>
          <CardDescription>
            Manage and monitor all active delivery routes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Stops</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Distance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                    No routes found.
                  </TableCell>
                </TableRow>
              ) : (
                routes?.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell className="font-medium">{route.id.split('-')[0]}</TableCell>
                    <TableCell>{route.execution_date}</TableCell>
                    <TableCell>{route.stops.length}</TableCell>
                    <TableCell>
                      <Badge variant={route.status === 'PLANNED' ? 'outline' : 'default'}>
                        {route.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {route.planned_distance ? `${(route.planned_distance / 1000).toFixed(1)} km` : '-'}
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
