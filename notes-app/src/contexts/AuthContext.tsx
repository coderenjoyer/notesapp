import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/SupabaseClient';

interface AuthContextType {
  username: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsernameState] = useState<string | null>(null);

  // Automatically restore session
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        setUsernameState(data.session.user.email || null);
      }
    };
    getSession();

    // Listen for login/logout events
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsernameState(session?.user?.email || null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const register = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Sign up the user with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({ 
        email, 
        password 
      });
      
      if (signUpError) {
        console.error('Sign-up error:', signUpError.message);
        
        // Check if user already exists
        if (signUpError.message.includes('already registered') || signUpError.message.includes('already exists')) {
          return { success: false, error: 'This email is already registered. Please use the login tab.' };
        }
        
        return { success: false, error: signUpError.message };
      }

      // Store the user in the users table (using upsert to handle existing users)
      if (data?.user) {
        const { error: upsertError } = await supabase
          .from('users')
          .upsert([{
              id: data.user.id,
              email: email,
              created_at: new Date().toISOString(),
          }], {
            onConflict: 'id'
          });

        if (upsertError) {
          console.error('Error storing user:', upsertError.message);
          // Still allow the user to proceed since auth was successful
        }
      }

      // Supabase auto-logs in user after sign-up (if configured)
      setUsernameState(email);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'An unexpected error occurred during registration.' };
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Login error:', error.message);
      
      // Provide user-friendly error messages
      if (error.message.includes('Invalid login credentials') || error.message.includes('Email not confirmed')) {
        return { success: false, error: 'Invalid email or password. Please check your credentials.' };
      }
      
      return { success: false, error: error.message };
    }
    setUsernameState(data?.user?.email || null);
    return { success: true };
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUsernameState(null);
  };

  return (
    <AuthContext.Provider value={{ username, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
