import { useState } from 'react';
import { useSenders } from '@/hooks/useSenders';
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
import { Sender } from '@/types';
import { formatDateTime, maskData } from '@/utils/helpers';
import { UserCheck, Plus, Edit, UserX, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const columns: Column<Sender>[] = [
  {
    key: 'fullName',
    header: 'Name',
    render: (s) => <span className="font-medium">{s.fullName}</span>,
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
    key: 'city',
    header: 'City',
  },
  {
    key: 'identityNumber',
    header: 'ID Number',
    render: (s) => (
      <span className="font-mono text-sm">{maskData(s.identityNumber)}</span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (s) => <StatusBadge status={s.status} />,
  },
  {
    key: 'updatedAt',
    header: 'Last Updated',
    render: (s) => (
      <span className="text-muted-foreground text-sm">
        {formatDateTime(s.updatedAt)}
      </span>
    ),
  },
];

type SenderFormData = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  identityType: 'passport' | 'residence_card' | 'drivers_license';
  identityNumber: string;
  status: 'active' | 'inactive' | 'pending_verification';
};

const initialFormData: SenderFormData = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  identityType: 'residence_card',
  identityNumber: '',
  status: 'pending_verification',
};

export default function SendersPage() {
  const { user } = useAuth();
  const { senders, isLoading, createSender, updateSender, deactivateSender } = useSenders();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSender, setEditingSender] = useState<Sender | null>(null);
  const [formData, setFormData] = useState<SenderFormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenCreate = () => {
    setEditingSender(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (sender: Sender) => {
    setEditingSender(sender);
    setFormData({
      fullName: sender.fullName,
      email: sender.email,
      phone: sender.phone,
      address: sender.address,
      city: sender.city,
      identityType: sender.identityType,
      identityNumber: sender.identityNumber,
      status: sender.status,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    
    try {
      if (editingSender) {
        await updateSender(editingSender.id, formData);
        toast({ title: 'Sender updated successfully' });
      } else {
        await createSender({
          ...formData,
          userId: user?.id || '',
          country: 'Japan',
        });
        toast({ title: 'Sender created successfully' });
      }
      setIsDialogOpen(false);
    } catch {
      toast({ title: 'Error saving sender', variant: 'destructive' });
    }
    
    setIsSaving(false);
  };

  const handleDeactivate = async (sender: Sender) => {
    if (!confirm(`Are you sure you want to deactivate ${sender.fullName}?`)) return;
    
    try {
      await deactivateSender(sender.id);
      toast({ title: 'Sender deactivated successfully' });
    } catch {
      toast({ title: 'Error deactivating sender', variant: 'destructive' });
    }
  };

  const columnsWithActions: Column<Sender>[] = [
    ...columns,
    {
      key: 'actions',
      header: 'Actions',
      render: (s) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(s);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          {s.status !== 'inactive' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleDeactivate(s);
              }}
            >
              <UserX className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (senders.length === 0 && !isLoading) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Senders" description="Manage sender profiles" />
        <EmptyState
          icon={UserCheck}
          title="No senders found"
          description="Register your first sender to start sending money"
          action={{
            label: 'Add Sender',
            onClick: handleOpenCreate,
          }}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Senders"
        description="Manage sender profiles from Japan"
        action={
          <Button onClick={handleOpenCreate} className="btn-gradient">
            <Plus className="mr-2 h-4 w-4" />
            Add Sender
          </Button>
        }
      />

      <DataTable
        columns={columnsWithActions}
        data={senders}
        isLoading={isLoading}
        rowKey={(s) => s.id}
        emptyMessage="No senders found"
      />

      {/* Sender Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingSender ? 'Edit Sender' : 'Register New Sender'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder="Takeshi Yamamoto"
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
                placeholder="takeshi@email.com"
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

            <div className="col-span-2 space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="1-2-3 Shibuya"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                placeholder="Tokyo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="identityType">ID Type</Label>
              <Select
                value={formData.identityType}
                onValueChange={(value: SenderFormData['identityType']) =>
                  setFormData({ ...formData, identityType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ID type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residence_card">Residence Card</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="drivers_license">Driver's License</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="identityNumber">ID Number</Label>
              <Input
                id="identityNumber"
                value={formData.identityNumber}
                onChange={(e) =>
                  setFormData({ ...formData, identityNumber: e.target.value })
                }
                placeholder="RC123456789"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: SenderFormData['status']) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending_verification">Pending Verification</SelectItem>
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
              ) : editingSender ? (
                'Update'
              ) : (
                'Register'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
