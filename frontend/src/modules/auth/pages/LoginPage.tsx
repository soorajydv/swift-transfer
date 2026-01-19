import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { Button } from '@/shared/components/button';
import { Input } from '@/shared/components/input';
import { Label } from '@/shared/components/label';
import { Wallet, ArrowRight, Loader2, Shield, Globe, Zap } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/shared/components/input-otp';
import { isValidEmail } from '@/shared/utils/helpers';
import { OTP_EXPIRY_SECONDS } from '@/shared/utils/constants';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, requestOtp, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    const result = await requestOtp(email);
    setIsLoading(false);

    if (result.success) {
      setStep('otp');
      setCountdown(OTP_EXPIRY_SECONDS);
    } else {
      setError(result.error || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;
    
    setError('');
    setIsLoading(true);
    const result = await login(email, otp);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || 'Invalid OTP');
      setOtp('');
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setError('');
    setIsLoading(true);
    const result = await requestOtp(email);
    setIsLoading(false);

    if (result.success) {
      setCountdown(OTP_EXPIRY_SECONDS);
    } else {
      setError(result.error || 'Failed to resend OTP');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Features */}
      <div className="hidden lg:flex lg:w-1/2 gradient-dark p-12 flex-col justify-between relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-accent blur-3xl" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center">
              <Wallet className="h-6 w-6 text-accent-foreground" />
            </div>
            <span className="text-2xl font-bold text-primary-foreground">RemitPro</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-primary-foreground leading-tight">
              Fast & Secure
              <br />
              Money Transfer
            </h1>
            <p className="text-lg text-primary-foreground/70 max-w-md">
              Send money from Japan to Nepal with competitive rates and reliable service.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4 text-primary-foreground/80">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-primary-foreground">Bank-Level Security</p>
              <p className="text-sm text-primary-foreground/60">256-bit encryption for all transactions</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-primary-foreground/80">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-primary-foreground">Best Exchange Rates</p>
              <p className="text-sm text-primary-foreground/60">Competitive JPY to NPR rates</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-primary-foreground/80">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-primary-foreground">Fast Transfers</p>
              <p className="text-sm text-primary-foreground/60">Money delivered within minutes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Wallet className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">RemitPro</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              {step === 'email' ? 'Welcome back' : 'Enter verification code'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {step === 'email'
                ? 'Enter your email to receive a one-time password'
                : `We've sent a 6-digit code to ${email}`}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleRequestOtp} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 input-focus"
                  required
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 btn-gradient text-base"
                disabled={isLoading || !email}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              {/* <p className="text-center text-sm text-muted-foreground">
                <span className="font-medium">Demo:</span> Use code{' '}
                <code className="px-1.5 py-0.5 rounded bg-muted font-mono">123456</code>
              </p> */}
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => {
                    setOtp(value);
                    if (value.length === 6) {
                      handleVerifyOtp();
                    }
                  }}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                onClick={handleVerifyOtp}
                className="w-full h-12 btn-gradient text-base"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Verify & Login'
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={countdown > 0}
                  className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
                >
                  {countdown > 0
                    ? `Resend code in ${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}`
                    : 'Resend code'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setOtp('');
                  setError('');
                }}
                className="w-full text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back to email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
