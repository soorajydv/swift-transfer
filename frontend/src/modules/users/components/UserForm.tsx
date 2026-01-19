import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/shared/components/button';
import { Input } from '@/shared/components/input';
import { Label } from '@/shared/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/select';
import { PageHeader } from '@/shared/components/PageHeader';
import { useToast } from '@/shared/hooks/use-toast';
import UsersService from '@/modules/users/services/users.service';
import { ArrowLeft, Loader2, AlertTriangle, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/components/alert';

type UserFormData = {
  fullName: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'OPERATOR' | 'VIEWER';
  status: 'ACTIVE' | 'INACTIVE';
};

const initialFormData: UserFormData = {
  fullName: '',
  email: '',
  phone: '',
  role: 'VIEWER',
  status: 'ACTIVE',
};

export function UserForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit && id) {
      const fetchUser = async () => {
        setIsLoading(true);
        try {
          const response = await UsersService.getById(id);
          if (response.success && response.data) {
            const user = response.data;
            setFormData({
              fullName: user.fullName,
              email: user.email,
              phone: user.phone || '',
              role: user.role,
              status: user.status,
            });
          }
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || error?.message || 'Error loading user';
          setError(errorMessage);
          toast({ title: errorMessage, variant: 'destructive' });
        } finally {
          setIsLoading(false);
        }
      };

      fetchUser();
    }
  }, [isEdit, id, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (isEdit && id) {
        await UsersService.update(id, formData);
        toast({ title: 'User updated successfully' });
      } else {
        await UsersService.create(formData);
        toast({ title: 'User created successfully' });
      }
      navigate('/users');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error saving user';
      setError(errorMessage);
      toast({ title: errorMessage, variant: 'destructive' });
    }

    setIsSaving(false);
  };

  const handleCancel = () => {
    navigate('/users');
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleCancel}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>

        <PageHeader
          title={isEdit ? 'Edit User' : 'Create New User'}
          description={isEdit ? 'Update user information and permissions' : 'Create a new user account'}
        />
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="h-auto p-1 hover:bg-destructive/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading user data...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+81-90-1234-5678"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: UserFormData['role']) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="OPERATOR">Operator</SelectItem>
                    <SelectItem value="VIEWER">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: UserFormData['status']) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-border">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="btn-gradient">
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isEdit ? (
                  'Update User'
                ) : (
                  'Create User'
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
