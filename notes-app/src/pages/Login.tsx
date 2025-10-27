import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUsername = loginUsername.trim();
    
    if (!trimmedUsername || !loginPassword) {
      toast({
        variant: "destructive",
        title: "All fields required",
        description: "Please enter both email and password.",
      });
      return;
    }

    const result = await login(trimmedUsername, loginPassword);
    
    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: result.error || "Invalid username or password.",
      });
      return;
    }

    navigate('/notes');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUsername = registerUsername.trim();
    
    if (!trimmedUsername || !registerPassword) {
      toast({
        variant: "destructive",
        title: "All fields required",
        description: "Please enter username and password.",
      });
      return;
    }

    if (trimmedUsername.length > 50) {
      toast({
        variant: "destructive",
        title: "Email too long",
        description: "Email must be less than 50 characters.",
      });
      return;
    }

    if (registerPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 6 characters.",
      });
      return;
    }

    if (registerPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
      });
      return;
    }

    const result = await register(trimmedUsername, registerPassword);
    
    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: result.error || "An error occurred during registration.",
      });
      return;
    }

    toast({
      title: "Account created",
      description: "Your account has been created successfully.",
    });
    navigate('/notes');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto bg-primary rounded-full p-4 w-16 h-16 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl">Welcome to Notes</CardTitle>
            <CardDescription className="mt-2">
              Secure your personal notes with a password
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Password (min. 6 characters)"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
