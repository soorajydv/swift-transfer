import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/common/PageHeader';
import { useSenders } from '@/hooks/useSenders';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Sender } from '@/types';
import { ArrowLeft, Loader2 } from 'lucide-react';

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

export function SenderForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { createSender, updateSender, senders } = useSenders();
  const { toast } = useToast();

  const [formData, setFormData] = useState<SenderFormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isEdit = Boolean(id);
  const editingSender = senders.find(s => s.id === id);

  useEffect(() => {
    if (isEdit && editingSender) {
      setFormData({
        fullName: editingSender.fullName,
        email: editingSender.email,
        phone: editingSender.phone,
        address: editingSender.address,
        city: editingSender.city,
        identityType: editingSender.identityType,
        identityNumber: editingSender.identityNumber,
        status: editingSender.status,
      });
    }
  }, [isEdit, editingSender]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (isEdit && id) {
        await updateSender(id, formData);
        toast({ title: 'Sender updated successfully' });
      } else {
        await createSender({
          ...formData,
          userId: user?.id || '',
          country: 'Japan',
        });
        toast({ title: 'Sender created successfully' });
      }
      navigate('/senders');
    } catch {
      toast({ title: 'Error saving sender', variant: 'destructive' });
    }

    setIsSaving(false);
  };

  const handleCancel = () => {
    navigate('/senders');
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
          Back to Senders
        </Button>

        <PageHeader
          title={isEdit ? 'Edit Sender' : 'Register New Sender'}
          description={isEdit ? 'Update sender information' : 'Register a new sender from Japan'}
        />
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Takeshi Yamamoto"
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
                placeholder="takeshi@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+81-90-1234-5678"
                required
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="1-2-3 Shibuya"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Tokyo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="identityType">ID Type *</Label>
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
              <Label htmlFor="identityNumber">ID Number *</Label>
              <Input
                id="identityNumber"
                value={formData.identityNumber}
                onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
                placeholder="RC123456789"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
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

          <div className="flex gap-4 pt-6 border-t border-border">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="btn-gradient">
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEdit ? (
                'Update Sender'
              ) : (
                'Register Sender'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
