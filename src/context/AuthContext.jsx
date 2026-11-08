import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Static demo accounts for testing and demonstration
export const DEMO_ACCOUNTS = [
  {
    email: 'hr.admin@nemsu.edu.ph',
    password: 'admin123',
    name: 'Dr. Evelyn V. Ramos',
    role: 'HR Director',
    staffId: 'HR-CAN-2024-01',
    department: 'Human Resource Management Office',
    campus: 'NEMSU – Cantilan Campus',
  },
  {
    email: 'hr.staff@nemsu.edu.ph',
    password: 'password123',
    name: 'Michael R. Alcantara',
    role: 'HR Performance Analyst',
    staffId: 'HR-CAN-2024-04',
    department: 'Human Resource Management Office',
    campus: 'NEMSU – Cantilan Campus',
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nemsu_feas_hr_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  // Synchronize with localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('nemsu_feas_hr_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('nemsu_feas_hr_user');
    }
  }, [user]);

  /**
   * Static authentication verification
   * Supports pre-configured demo accounts, or any valid @nemsu.edu.ph email for flexible testing
   */
  const login = async (identifier, password) => {
    setIsLoading(true);

    // Simulate authentic network latency for realistic HCI status visibility
    await new Promise((resolve) => setTimeout(resolve, 600));

    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    // Check specific demo accounts first
    const matched = DEMO_ACCOUNTS.find(
      (acc) =>
        (acc.email.toLowerCase() === cleanId || acc.staffId.toLowerCase() === cleanId) &&
        acc.password === cleanPass
    );

    if (matched) {
      const authenticatedUser = {
        email: matched.email,
        name: matched.name,
        role: matched.role,
        staffId: matched.staffId,
        department: matched.department,
        campus: matched.campus,
        loginAt: new Date().toISOString(),
      };
      setUser(authenticatedUser);
      setIsLoading(false);
      return { success: true };
    }

    // Fallback: If tester inputs any valid @nemsu.edu.ph email with password "admin123" or "password123"
    if (cleanId.includes('@nemsu.edu.ph') && (cleanPass === 'admin123' || cleanPass === 'password123')) {
      const fallbackUser = {
        email: cleanId,
        name: cleanId.split('@')[0].replace('.', ' ').toUpperCase(),
        role: 'HR Officer',
        staffId: 'HR-DEMO-99',
        department: 'Human Resource Management Office',
        campus: 'NEMSU – Cantilan Campus',
        loginAt: new Date().toISOString(),
      };
      setUser(fallbackUser);
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return {
      success: false,
      error: 'Invalid credentials. Please verify your institutional email and password.',
    };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nemsu_feas_hr_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        demoAccounts: DEMO_ACCOUNTS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
