import { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User } from '@/types';
import { formatDateTime } from '@/utils/helpers';
import { Users, Plus, Edit, UserX, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const columns: Column<User>[] = [
  {
    key: 'fullName',
    header: 'Name',
    render: (u) => <span className="font-medium">{u.fullName}</span>,
  },
  {
    key: 'email',
    header: 'Email',
  },
  {
    key: 'phone',
    header: 'Phone',
  },
  {
    key: 'role',
    header: 'Role',
    render: (u) => (
      <span className="capitalize px-2 py-1 bg-muted rounded-md text-sm">
        {u.role}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (u) => <StatusBadge status={u.status} />,
  },
  {
    key: 'updatedAt',
    header: 'Last Updated',
    render: (u) => (
      <span className="text-muted-foreground text-sm">
        {formatDateTime(u.updatedAt)}
      </span>
    ),
  },
];

type UserFormData = {
  fullName: string;
  email: string;
  phone: string;
  role: 'admin' | 'operator' | 'viewer';
  status: 'active' | 'inactive';
};

const initialFormData: UserFormData = {
  fullName: '',
  email: '',
  phone: '',
  role: 'viewer',
  status: 'active',
};

export default function UsersPage() {
  const { users, isLoading, createUser, updateUser, deactivateUser } = useUsers();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    
    try {
      if (editingUser) {
        await updateUser(editingUser.id, formData);
        toast({ title: 'User updated successfully' });
      } else {
        await createUser(formData);
        toast({ title: 'User created successfully' });
      }
      setIsDialogOpen(false);
    } catch {
      toast({ title: 'Error saving user', variant: 'destructive' });
    }
    
    setIsSaving(false);
  };

  const handleDeactivate = async (user: User) => {
    if (!confirm(`Are you sure you want to deactivate ${user.fullName}?`)) return;
    
    try {
      await deactivateUser(user.id);
      toast({ title: 'User deactivated successfully' });
    } catch {
      toast({ title: 'Error deactivating user', variant: 'destructive' });
    }
  };

  const columnsWithActions: Column<User>[] = [
    ...columns,
    {
      key: 'actions',
      header: 'Actions',
      render: (u) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(u);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          {u.status === 'active' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleDeactivate(u);
              }}
            >
              <UserX className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (users.length === 0 && !isLoading) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Users" description="Manage system users" />
        <EmptyState
          icon={Users}
          title="No users found"
          description="Create your first user to get started"
          action={{
            label: 'Add User',
            onClick: handleOpenCreate,
          }}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Users"
        description="Manage system users and their roles"
        action={
          <Button onClick={handleOpenCreate} className="btn-gradient">
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        }
      />

      <DataTable
        columns={columnsWithActions}
        data={users}
        isLoading={isLoading}
        rowKey={(u) => u.id}
        emptyMessage="No users found"
      />

      {/* User Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Edit User' : 'Create New User'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+81-90-1234-5678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'admin' | 'operator' | 'viewer') =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="operator">Operator</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'inactive') =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editingUser ? (
                'Update'
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
