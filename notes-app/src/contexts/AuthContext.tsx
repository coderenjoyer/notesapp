import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  username: string | null;
  login: (username: string, password: string) => boolean;
  register: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple encoding for localStorage (NOT secure, just better than plain text)
const encodePassword = (password: string): string => {
  return btoa(password);
};

const verifyPassword = (input: string, stored: string): boolean => {
  return encodePassword(input) === stored;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsernameState] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('notesCurrentUser');
    if (stored) {
      setUsernameState(stored);
    }
  }, []);

  const register = (username: string, password: string): boolean => {
    const usersKey = 'notesUsers';
    const users = JSON.parse(localStorage.getItem(usersKey) || '{}');
    
    if (users[username]) {
      return false; // User already exists
    }
    
    users[username] = encodePassword(password);
    localStorage.setItem(usersKey, JSON.stringify(users));
    localStorage.setItem('notesCurrentUser', username);
    setUsernameState(username);
    return true;
  };

  const login = (username: string, password: string): boolean => {
    const usersKey = 'notesUsers';
    const users = JSON.parse(localStorage.getItem(usersKey) || '{}');
    
    if (!users[username]) {
      return false; // User doesn't exist
    }
    
    if (!verifyPassword(password, users[username])) {
      return false; // Wrong password
    }
    
    localStorage.setItem('notesCurrentUser', username);
    setUsernameState(username);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('notesCurrentUser');
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
