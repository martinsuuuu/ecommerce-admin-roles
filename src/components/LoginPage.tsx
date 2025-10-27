import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ShoppingBag, Lock, Mail, User, Sparkles, ArrowLeft, Baby } from 'lucide-react';
import logoImage from 'figma:asset/086cf3cc9a736a513ded11d47e82ce484a90947a.png';

type User = {
  id: string;
  email: string;
  name: string;
  role: 'master' | 'second' | 'customer';
};

type LoginPageProps = {
  onLogin: (user: User) => void;
  onBackToPublic?: () => void;
  cartItemCount?: number;
};

export function LoginPage({ onLogin, onBackToPublic, cartItemCount }: LoginPageProps) {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize default admin accounts on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-793a174e/init`,
          {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          }
        );
        const data = await response.json();
        console.log('Initialization response:', data);
        
        // Also fetch debug info
        const debugResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-793a174e/debug/users`,
          {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          }
        );
        const debugData = await debugResponse.json();
        console.log('Debug - Users in database:', debugData);
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };
    initializeApp();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('Login attempt:', { email: loginEmail, password: loginPassword });

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-793a174e/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email: loginEmail, password: loginPassword }),
        }
      );

      const data = await response.json();
      console.log('Login response:', { status: response.status, data });

      if (!response.ok) {
        toast.error(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      toast.success('Welcome back! 🎉');
      onLogin(data.user);
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-793a174e/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: signupEmail,
            password: signupPassword,
            name: signupName,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Signup failed');
        return;
      }

      toast.success('Account created! Please login. ✨');
      setSignupEmail('');
      setSignupPassword('');
      setSignupName('');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#faf3f0] via-[#fef7f3] to-[#fff9f5] p-4 relative overflow-hidden font-['Poppins',sans-serif]">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#f8bbd0]/30 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#81d4fa]/30 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#fff59d]/30 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000"></div>
      </div>

      {/* Back to Home Button */}
      {onBackToPublic && (
        <Button
          onClick={onBackToPublic}
          variant="ghost"
          className="absolute top-4 left-4 z-20 text-[#7d5a50] hover:text-[#d4a5a5] hover:bg-[#fff4e6]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Shop
        </Button>
      )}

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src={logoImage} alt="Little Mija" className="h-20 w-20 rounded-full shadow-lg" />
          </div>
          <h1 className="text-3xl font-bold text-[#7d5a50]">
            Little Mija
          </h1>
          <p className="text-[#a67c6d] mt-2">Admin & Customer Portal</p>
        </div>

        {/* Demo Credentials Card */}
        <Card className="border-2 border-[#d4a5a5]/30 bg-white/90 backdrop-blur-sm shadow-xl hover-lift rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-[#f8bbd0]" />
              <h3 className="font-semibold text-[#7d5a50]">Demo Credentials</h3>
            </div>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-start gap-2 p-3 rounded-xl bg-[#fff4e6]/70 border border-[#ffb4a8]/30">
                <div className="flex-1">
                  <p className="font-semibold text-[#7d5a50]">Master Admin</p>
                  <p className="text-[#a67c6d]">admin@shop.com / admin123</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-xs text-[#f8bbd0] hover:text-[#f48fb1] hover:bg-[#fff4e6]"
                  onClick={() => {
                    setLoginEmail('admin@shop.com');
                    setLoginPassword('admin123');
                  }}
                >
                  Use
                </Button>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-xl bg-[#e3f2fd]/70 border border-[#81d4fa]/30">
                <div className="flex-1">
                  <p className="font-semibold text-[#7d5a50]">Warehouse Staff</p>
                  <p className="text-[#a67c6d]">warehouse@shop.com / warehouse123</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-xs text-[#81d4fa] hover:text-[#4fc3f7] hover:bg-[#e3f2fd]"
                  onClick={() => {
                    setLoginEmail('warehouse@shop.com');
                    setLoginPassword('warehouse123');
                  }}
                >
                  Use
                </Button>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-xl bg-gradient-to-r from-[#fef7f3] to-[#fff4e6] border-2 border-[#f8bbd0]/40">
                <div className="flex-1">
                  <p className="font-semibold text-[#7d5a50]">👶 Customer Account</p>
                  <p className="text-[#a67c6d]">customer@shop.com / customer123</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-xs text-[#f8bbd0] hover:text-[#f48fb1] hover:bg-white"
                  onClick={() => {
                    setLoginEmail('customer@shop.com');
                    setLoginPassword('customer123');
                  }}
                >
                  Use
                </Button>
              </div>
              <p className="text-[#a67c6d] pt-2 text-center">
                {cartItemCount && cartItemCount > 0 
                  ? `🛒 You have ${cartItemCount} item${cartItemCount > 1 ? 's' : ''} in your cart`
                  : 'Or sign up for a new customer account'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Login/Signup Card */}
        <Card className="border-2 border-[#d4a5a5]/30 bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-[#7d5a50]">Welcome</CardTitle>
            <CardDescription className="text-[#a67c6d]">
              Login or create an account to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#fef7f3] border border-[#d4a5a5]/20">
                <TabsTrigger value="login" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#f8bbd0] data-[state=active]:to-[#ffc1e3] data-[state=active]:text-white rounded-lg">Login</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#f8bbd0] data-[state=active]:to-[#ffc1e3] data-[state=active]:text-white rounded-lg">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-[#7d5a50]">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#a67c6d]" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10 h-11 border-[#d4a5a5]/40 focus:border-[#f8bbd0] rounded-xl bg-white"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-[#7d5a50]">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#a67c6d]" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 h-11 border-[#d4a5a5]/40 focus:border-[#f8bbd0] rounded-xl bg-white"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-gradient-to-r from-[#f8bbd0] to-[#ffc1e3] hover:from-[#f48fb1] hover:to-[#f8bbd0] text-white shadow-lg rounded-xl" 
                    disabled={loading}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-[#7d5a50]">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#a67c6d]" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        className="pl-10 h-11 border-[#d4a5a5]/40 focus:border-[#f8bbd0] rounded-xl bg-white"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-[#7d5a50]">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#a67c6d]" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10 h-11 border-[#d4a5a5]/40 focus:border-[#f8bbd0] rounded-xl bg-white"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-[#7d5a50]">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#a67c6d]" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 h-11 border-[#d4a5a5]/40 focus:border-[#f8bbd0] rounded-xl bg-white"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-gradient-to-r from-[#f8bbd0] to-[#ffc1e3] hover:from-[#f48fb1] hover:to-[#f8bbd0] text-white shadow-lg rounded-xl" 
                    disabled={loading}
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-[#a67c6d]">
          Secure & reliable order management platform
        </p>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}