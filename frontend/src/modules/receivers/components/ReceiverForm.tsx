import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/shared/components/button';
import { Input } from '@/shared/components/input';
import { Label } from '@/shared/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/select';
import { PageHeader } from '@/shared/components/PageHeader';
import { useReceivers } from '@/modules/receivers/hooks/useReceivers';
import { useSenders } from '@/modules/senders/hooks/useSenders';
import { useToast } from '@/shared/hooks/use-toast';
import { NEPAL_BANKS } from '@/shared/utils/constants';
import { ArrowLeft, Loader2 } from 'lucide-react';

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

export function ReceiverForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { createReceiver, updateReceiver, receivers } = useReceivers();
  const { activeSenders } = useSenders();
  const { toast } = useToast();

  const [formData, setFormData] = useState<ReceiverFormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);

  const isEdit = Boolean(id);
  const editingReceiver = receivers.find(r => r.id === id);

  useEffect(() => {
    if (isEdit && editingReceiver) {
      setFormData({
        senderId: editingReceiver.senderId,
        fullName: editingReceiver.fullName,
        email: editingReceiver.email || '',
        phone: editingReceiver.phone,
        bankName: editingReceiver.bankName,
        bankBranch: editingReceiver.bankBranch,
        accountNumber: editingReceiver.accountNumber,
        address: editingReceiver.address,
        city: editingReceiver.city,
        relationship: editingReceiver.relationship,
        status: editingReceiver.status,
      });
    }
  }, [isEdit, editingReceiver]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (isEdit && id) {
        await updateReceiver(id, formData);
        toast({ title: 'Receiver updated successfully' });
      } else {
        await createReceiver({
          ...formData,
          country: 'Nepal',
        });
        toast({ title: 'Receiver created successfully' });
      }
      navigate('/receivers');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error saving receiver';
      toast({ title: errorMessage, variant: 'destructive' });
    }

    setIsSaving(false);
  };

  const handleCancel = () => {
    navigate('/receivers');
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
          Back to Receivers
        </Button>

        <PageHeader
          title={isEdit ? 'Edit Receiver' : 'Add New Receiver'}
          description={isEdit ? 'Update receiver information' : 'Add a new receiver in Nepal'}
        />
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="senderId">Associated Sender *</Label>
              <Select
                value={formData.senderId}
                onValueChange={(value) =>
                  setFormData({ ...formData, senderId: value })
                }
                required
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

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Ram Sharma"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ram@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+977-98-1234567"
                required
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="bankName">Bank *</Label>
              <Select
                value={formData.bankName}
                onValueChange={(value) =>
                  setFormData({ ...formData, bankName: value })
                }
                required
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
              <Label htmlFor="bankBranch">Branch *</Label>
              <Input
                id="bankBranch"
                value={formData.bankBranch}
                onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })}
                placeholder="Kathmandu Main"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number *</Label>
              <Input
                id="accountNumber"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                placeholder="0123456789012345"
                required
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Thamel"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Kathmandu"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship *</Label>
              <Input
                id="relationship"
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                placeholder="Brother, Sister, Friend, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: ReceiverFormData['status']) =>
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

          <div className="flex gap-4 pt-6 border-t border-border">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="btn-gradient">
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEdit ? (
                'Update Receiver'
              ) : (
                'Add Receiver'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
