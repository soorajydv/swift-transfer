import { useState } from 'react';
import { useReceivers } from '@/hooks/useReceivers';
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
import { Receiver } from '@/types';
import { formatDateTime, maskData } from '@/utils/helpers';
import { NEPAL_BANKS } from '@/utils/constants';
import { UserPlus, Plus, Edit, UserX, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSenders } from '@/hooks/useSenders';

const columns: Column<Receiver>[] = [
  {
    key: 'fullName',
    header: 'Name',
    render: (r) => <span className="font-medium">{r.fullName}</span>,
  },
  {
    key: 'phone',
    header: 'Phone',
  },
  {
    key: 'bankName',
    header: 'Bank',
  },
  {
    key: 'accountNumber',
    header: 'Account',
    render: (r) => (
      <span className="font-mono text-sm">{maskData(r.accountNumber)}</span>
    ),
  },
  {
    key: 'city',
    header: 'City',
  },
  {
    key: 'relationship',
    header: 'Relationship',
  },
  {
    key: 'status',
    header: 'Status',
    render: (r) => <StatusBadge status={r.status} />,
  },
];

type ReceiverFormData = {
  senderId: string;
  fullName: string;
  email: string;
  phone: string;
  bankName: string;
  bankBranch: string;
  accountNumber: string;
  address: string;
  city: string;
  relationship: string;
  status: 'active' | 'inactive';
};

const initialFormData: ReceiverFormData = {
  senderId: '',
  fullName: '',
  email: '',
  phone: '',
  bankName: '',
  bankBranch: '',
  accountNumber: '',
  address: '',
  city: '',
  relationship: '',
  status: 'active',
};

export default function ReceiversPage() {
  const { receivers, isLoading, createReceiver, updateReceiver, deactivateReceiver } = useReceivers();
  const { activeSenders } = useSenders();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReceiver, setEditingReceiver] = useState<Receiver | null>(null);
  const [formData, setFormData] = useState<ReceiverFormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenCreate = () => {
    setEditingReceiver(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (receiver: Receiver) => {
    setEditingReceiver(receiver);
    setFormData({
      senderId: receiver.senderId,
      fullName: receiver.fullName,
      email: receiver.email || '',
      phone: receiver.phone,
      bankName: receiver.bankName,
      bankBranch: receiver.bankBranch,
      accountNumber: receiver.accountNumber,
      address: receiver.address,
      city: receiver.city,
      relationship: receiver.relationship,
      status: receiver.status,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    
    try {
      if (editingReceiver) {
        await updateReceiver(editingReceiver.id, formData);
        toast({ title: 'Receiver updated successfully' });
      } else {
        await createReceiver({
          ...formData,
          country: 'Nepal',
        });
        toast({ title: 'Receiver created successfully' });
      }
      setIsDialogOpen(false);
    } catch {
      toast({ title: 'Error saving receiver', variant: 'destructive' });
    }
    
    setIsSaving(false);
  };

  const handleDeactivate = async (receiver: Receiver) => {
    if (!confirm(`Are you sure you want to deactivate ${receiver.fullName}?`)) return;
    
    try {
      await deactivateReceiver(receiver.id);
      toast({ title: 'Receiver deactivated successfully' });
    } catch {
      toast({ title: 'Error deactivating receiver', variant: 'destructive' });
    }
  };

  const columnsWithActions: Column<Receiver>[] = [
    ...columns,
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(r);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          {r.status === 'active' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleDeactivate(r);
              }}
            >
              <UserX className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (receivers.length === 0 && !isLoading) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Receivers" description="Manage receiver profiles" />
        <EmptyState
          icon={UserPlus}
          title="No receivers found"
          description="Add your first receiver in Nepal to start sending money"
          action={{
            label: 'Add Receiver',
            onClick: handleOpenCreate,
          }}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Receivers"
        description="Manage receiver profiles in Nepal"
        action={
          <Button onClick={handleOpenCreate} className="btn-gradient">
            <Plus className="mr-2 h-4 w-4" />
            Add Receiver
          </Button>
        }
      />

      <DataTable
        columns={columnsWithActions}
        data={receivers}
        isLoading={isLoading}
        rowKey={(r) => r.id}
        emptyMessage="No receivers found"
      />

      {/* Receiver Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingReceiver ? 'Edit Receiver' : 'Add New Receiver'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="senderId">Associated Sender</Label>
              <Select
                value={formData.senderId}
                onValueChange={(value) =>
                  setFormData({ ...formData, senderId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sender" />
                </SelectTrigger>
                <SelectContent>
                  {activeSenders.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder="Ram Sharma"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="ram@email.com"
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
                placeholder="+977-98-1234567"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="bankName">Bank</Label>
              <Select
                value={formData.bankName}
                onValueChange={(value) =>
                  setFormData({ ...formData, bankName: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bank" />
                </SelectTrigger>
                <SelectContent>
                  {NEPAL_BANKS.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankBranch">Branch</Label>
              <Input
                id="bankBranch"
                value={formData.bankBranch}
                onChange={(e) =>
                  setFormData({ ...formData, bankBranch: e.target.value })
                }
                placeholder="Kathmandu Main"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                value={formData.accountNumber}
                onChange={(e) =>
                  setFormData({ ...formData, accountNumber: e.target.value })
                }
                placeholder="0123456789012345"
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
                placeholder="Thamel"
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
                placeholder="Kathmandu"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship</Label>
              <Input
                id="relationship"
                value={formData.relationship}
                onChange={(e) =>
                  setFormData({ ...formData, relationship: e.target.value })
                }
                placeholder="Brother, Sister, Friend, etc."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editingReceiver ? (
                'Update'
              ) : (
                'Add Receiver'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
