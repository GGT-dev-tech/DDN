import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/components/Card';
import { Button } from '../../shared/ui/components/Button';
import { Input } from '../../shared/ui/components/Input';

export function SettingsPage() {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: implement settings mutation
    alert('Settings saved!');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Tenant Configuration</CardTitle>
          <CardDescription>
            Update your organization's settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4 max-w-md" onSubmit={handleSave}>
            <div className="space-y-2">
              <label htmlFor="companyName" className="text-sm font-medium leading-none">
                Company Name
              </label>
              <Input id="companyName" defaultValue="DDN Management" />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="supportEmail" className="text-sm font-medium leading-none">
                Support Email
              </label>
              <Input id="supportEmail" type="email" defaultValue="support@ddn-management.local" />
            </div>

            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
