import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { createClient } from '@supabase/supabase-js';
import LoginDialog from './auth/LoginDialog';
import RegisterDialog from './auth/RegisterDialog';
import UserMenu from './auth/UserMenu';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('Invalid Supabase URL format:', error);
  throw new Error('Invalid Supabase URL format. Please check your VITE_SUPABASE_URL environment variable.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Header = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Supabase connection error:', error.message);
          toast({
            variant: "destructive",
            title: "Connection Error",
            description: "Unable to connect to authentication service. Please check configuration.",
          });
        } else {
          console.log('Supabase connection successful');
          if (data?.session?.user) {
            setUser(data.session.user);
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };

    checkConnection();
  }, [toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setUser(data.user);
      setIsLoginOpen(false);
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      setIsRegisterOpen(false);
      toast({
        title: "Success",
        description: "Registration successful! Please check your email to verify your account.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast({
      title: "Success",
      description: "Logged out successfully",
    });
  };

  return (
    <header className="w-full border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Blue Nectar Finder</h1>
        
        <UserMenu
          user={user}
          onLogin={() => setIsLoginOpen(true)}
          onRegister={() => setIsRegisterOpen(true)}
          onLogout={handleLogout}
        />

        <LoginDialog
          isOpen={isLoginOpen}
          onOpenChange={setIsLoginOpen}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          onSubmit={handleLogin}
        />

        <RegisterDialog
          isOpen={isRegisterOpen}
          onOpenChange={setIsRegisterOpen}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          onSubmit={handleRegister}
        />
      </div>
    </header>
  );
};

export default Header;