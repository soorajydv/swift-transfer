import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSenders } from '@/hooks/useSenders';
import { useReceivers } from '@/hooks/useReceivers';
import { useTransactions } from '@/hooks/useTransactions';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateTransferSummary, formatCurrency } from '@/utils/helpers';
import { TRANSFER_PURPOSES, EXCHANGE_RATE } from '@/utils/constants';
import { Send, ArrowRight, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SendMoneyPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { activeSenders, isLoading: sendersLoading } = useSenders();
  const { receivers: allReceivers, isLoading: receiversLoading } = useReceivers();
  const { createTransaction } = useTransactions();
  
  const [senderId, setSenderId] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [amountJPY, setAmountJPY] = useState('');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newTransactionId, setNewTransactionId] = useState('');

  // Filter receivers based on selected sender
  const availableReceivers = useMemo(() => {
    if (!senderId) return [];
    return allReceivers.filter(r => r.senderId === senderId && r.status === 'active');
  }, [senderId, allReceivers]);

  // Calculate transfer summary
  const summary = useMemo(() => {
    const amount = parseFloat(amountJPY) || 0;
    if (amount <= 0) return null;
    return calculateTransferSummary(amount);
  }, [amountJPY]);

  // Reset receiver when sender changes
  const handleSenderChange = (value: string) => {
    setSenderId(value);
    setReceiverId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!senderId || !receiverId || !amountJPY || !purpose) {
      toast({ 
        title: 'Please fill in all required fields', 
        variant: 'destructive' 
      });
      return;
    }

    const amount = parseFloat(amountJPY);
    if (amount <= 0) {
      toast({ 
        title: 'Please enter a valid amount', 
        variant: 'destructive' 
      });
      return;
    }

    setIsSubmitting(true);
    
    const result = await createTransaction({
      senderId,
      receiverId,
      amountJPY: amount,
      purpose,
      notes: notes || undefined,
    });

    setIsSubmitting(false);

    if (result.success && result.data) {
      setNewTransactionId(result.data.transactionId);
      setShowSuccess(true);
    } else {
      toast({ 
        title: result.error || 'Failed to create transaction', 
        variant: 'destructive' 
      });
    }
  };

  const handleNewTransfer = () => {
    setSenderId('');
    setReceiverId('');
    setAmountJPY('');
    setPurpose('');
    setNotes('');
    setShowSuccess(false);
  };

  if (showSuccess) {
    return (
      <div className="animate-fade-in">
        <div className="max-w-lg mx-auto text-center py-12">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Transfer Initiated!
          </h1>
          <p className="text-muted-foreground mb-6">
            Your transaction has been submitted successfully.
          </p>
          <div className="bg-muted/50 rounded-lg p-4 mb-8">
            <p className="text-sm text-muted-foreground mb-1">Transaction ID</p>
            <p className="font-mono font-medium text-lg">{newTransactionId}</p>
          </div>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => navigate('/transactions')}>
              View Transactions
            </Button>
            <Button onClick={handleNewTransfer} className="btn-gradient">
              New Transfer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Send Money"
        description="Transfer money from Japan to Nepal"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Transfer Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sender Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="sender">Sender *</Label>
                    <Select value={senderId} onValueChange={handleSenderChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sender" />
                      </SelectTrigger>
                      <SelectContent>
                        {sendersLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : activeSenders.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No active senders
                          </SelectItem>
                        ) : (
                          activeSenders.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.fullName}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Receiver Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="receiver">Receiver *</Label>
                    <Select
                      value={receiverId}
                      onValueChange={setReceiverId}
                      disabled={!senderId}
                    >
                      <SelectTrigger>
                        <SelectValue 
                          placeholder={senderId ? "Select receiver" : "Select sender first"} 
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {receiversLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : availableReceivers.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No receivers for this sender
                          </SelectItem>
                        ) : (
                          availableReceivers.map((r) => (
                            <SelectItem key={r.id} value={r.id}>
                              {r.fullName} - {r.bankName}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (JPY) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      ¥
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      min="1"
                      step="1"
                      value={amountJPY}
                      onChange={(e) => setAmountJPY(e.target.value)}
                      className="pl-8 h-12 text-lg"
                      placeholder="50,000"
                    />
                  </div>
                </div>

                {/* Purpose */}
                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose *</Label>
                  <Select value={purpose} onValueChange={setPurpose}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select transfer purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRANSFER_PURPOSES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional notes..."
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 btn-gradient text-base"
                  disabled={isSubmitting || !senderId || !receiverId || !amountJPY || !purpose}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Send Money
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Transfer Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {summary ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">You Send</span>
                    <span className="font-semibold text-lg">
                      {formatCurrency(summary.amountJPY, 'JPY')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Exchange Rate</span>
                    <span>1 JPY = {EXCHANGE_RATE} NPR</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Recipient Gets</span>
                    <span className="font-medium text-success">
                      {formatCurrency(summary.amountNPR, 'NPR')}
                    </span>
                  </div>

                  <hr className="border-border" />

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Service Fee</span>
                    <span>{formatCurrency(summary.serviceFee, 'NPR')}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      Service Fee (JPY)
                    </span>
                    <span>
                      ≈ {formatCurrency(Math.ceil(summary.serviceFeeJPY), 'JPY')}
                    </span>
                  </div>

                  <hr className="border-border" />

                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Amount</span>
                    <span className="font-bold text-lg">
                      {formatCurrency(Math.ceil(summary.totalJPY), 'JPY')}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-primary/5 text-sm">
                    <p className="text-muted-foreground">
                      Money will be credited to receiver's bank account
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Enter an amount to see the transfer summary
                  </p>
                </div>
              )}

              {/* Fee Tiers Info */}
              <div className="mt-6 p-4 rounded-lg bg-muted/50">
                <p className="font-medium text-sm mb-2">Service Fee Tiers</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• NPR 0 - 100,000: NPR 500</li>
                  <li>• NPR 100,000.01 - 200,000: NPR 1,000</li>
                  <li>• Above NPR 200,000: NPR 3,000</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
