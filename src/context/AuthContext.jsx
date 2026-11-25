import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const AuthContext = createContext(null);

// Seeded local demonstration accounts for zero-config evaluation
const INITIAL_DEMO_USERS = [
  {
    id: 'demo-user-customer-1',
    email: 'customer@busgo.in',
    password: 'Pass@123',
    role: 'customer',
    status: 'active',
    full_name: 'Priya Sharma',
    phone: '9876543210',
    city: 'Bengaluru',
  },
  {
    id: 'demo-user-operator-1',
    email: 'operator@sunrisetravels.in',
    password: 'Pass@123',
    role: 'operator',
    status: 'active',
    full_name: 'Rajesh Varma',
    phone: '9845012345',
    company_name: 'Sunrise Travels',
    fleet_size: 150,
    registration_number: 'KA-01-2024-ST-9912',
    city: 'Bengaluru',
  },
  {
    id: 'demo-user-operator-pending',
    email: 'operator@pending.in',
    password: 'Pass@123',
    role: 'operator',
    status: 'pending_approval',
    full_name: 'Vikas Patil',
    phone: '9820098200',
    company_name: 'CityLink Express',
    fleet_size: 45,
    registration_number: 'MH-12-2025-CL-4410',
    city: 'Pune',
  },
  {
    id: 'demo-user-admin-1',
    email: 'admin@busgo.in',
    password: 'Admin@123',
    role: 'admin',
    status: 'active',
    full_name: 'System Administrator',
    phone: '9900011223',
    city: 'Bengaluru',
  },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [demoUsers, setDemoUsers] = useState(() => {
    try {
      const stored = localStorage.getItem('busgo_demo_users');
      return stored ? JSON.parse(stored) : INITIAL_DEMO_USERS;
    } catch {
      return INITIAL_DEMO_USERS;
    }
  });

  // Save demo users to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('busgo_demo_users', JSON.stringify(demoUsers));
    } catch (e) {
      console.warn('Failed to persist demo users:', e);
    }
  }, [demoUsers]);

  // Fetch Supabase Profile with resilient fallback
  const fetchSupabaseProfile = async (userId, userMetadata = null, email = '') => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        return data;
      }

      // If profile row is not found or error occurred, attempt to construct fallback profile
      if (userMetadata || email) {
        const meta = userMetadata || {};
        const fallback = {
          id: userId,
          email: email || '',
          full_name: meta.full_name || (email ? email.split('@')[0] : 'User'),
          phone: meta.phone || null,
          role: meta.role || 'customer',
          status: meta.role === 'operator' ? 'pending_approval' : 'active',
          company_name: meta.company_name || null,
          fleet_size: meta.fleet_size ? parseInt(meta.fleet_size, 10) : null,
          registration_number: meta.registration_number || null,
          city: meta.city || null,
        };

        try {
          const { data: upserted } = await supabase
            .from('profiles')
            .upsert(fallback, { onConflict: 'id' })
            .select()
            .maybeSingle();
          if (upserted) return upserted;
        } catch {
          // ignore upsert error and return fallback object
        }
        return fallback;
      }
      return null;
    } catch (err) {
      console.warn('Unexpected profile fetch error:', err);
      return null;
    }
  };

  // Initialize session on mount
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      setIsLoading(true);

      let authenticated = false;

      if (isSupabaseConfigured && supabase) {
        // Real Supabase Auth Flow
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            setUser(session.user);
            const userProfile = await fetchSupabaseProfile(session.user.id, session.user.user_metadata, session.user.email);
            if (mounted) setProfile(userProfile);
            authenticated = true;
          }
        } catch (err) {
          console.error('Supabase session initialization failed:', err);
        }
      }

      // If no live Supabase session, check stored demo session
      if (!authenticated) {
        try {
          const storedSession = localStorage.getItem('busgo_demo_session');
          if (storedSession && mounted) {
            const parsedSession = JSON.parse(storedSession);
            const found = demoUsers.find((u) => u.id === parsedSession.id);
            if (found) {
              setUser({ id: found.id, email: found.email });
              setProfile(found);
            } else {
              localStorage.removeItem('busgo_demo_session');
            }
          }
        } catch (err) {
          console.error('Demo session restore error:', err);
        }
      }

      if (mounted) setIsLoading(false);
    };

    initializeAuth();

    // Listen to real Supabase auth state changes if connected
    let subscription = null;
    if (isSupabaseConfigured && supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          setUser(session.user);
          const userProfile = await fetchSupabaseProfile(session.user.id, session.user.user_metadata, session.user.email);
          setProfile(userProfile);
        } else {
          // Check if demo session exists before wiping
          const storedSession = localStorage.getItem('busgo_demo_session');
          if (!storedSession) {
            setUser(null);
            setProfile(null);
          }
        }
        setIsLoading(false);
      });
      subscription = data?.subscription;
    }

    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, [demoUsers]);

  // LOGIN (Customer, Operator, or Admin)
  const login = async (email, password, expectedRole = null) => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check if user is logging in with a known Demo account
    const matchedDemoUser = demoUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password === password
    );

    if (matchedDemoUser) {
      if (matchedDemoUser.status === 'suspended') {
        throw new Error('Account suspended by administrator.');
      }
      if (expectedRole && matchedDemoUser.role !== expectedRole) {
        throw new Error(
          `Access Denied: This portal requires ${expectedRole.toUpperCase()} credentials. Your account role is ${matchedDemoUser.role.toUpperCase()}.`
        );
      }

      const sessionObj = {
        id: matchedDemoUser.id,
        email: matchedDemoUser.email,
        role: matchedDemoUser.role,
        full_name: matchedDemoUser.full_name,
      };
      localStorage.setItem('busgo_demo_session', JSON.stringify(sessionObj));
      setUser({ id: matchedDemoUser.id, email: matchedDemoUser.email });
      setProfile(matchedDemoUser);
      return { user: { id: matchedDemoUser.id, email: matchedDemoUser.email }, profile: matchedDemoUser };
    }

    // 2. Production Supabase Auth Flow
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        if (error.message?.toLowerCase().includes('email not confirmed')) {
          throw new Error('Email address not confirmed. Please check your inbox for the confirmation email from Supabase, or contact support.');
        }
        throw new Error(error.message || 'Invalid email or password.');
      }

      // Fetch or self-heal user profile
      let userProfile = await fetchSupabaseProfile(data.user.id, data.user.user_metadata, cleanEmail);
      if (!userProfile) {
        const meta = data.user.user_metadata || {};
        userProfile = {
          id: data.user.id,
          email: cleanEmail,
          full_name: meta.full_name || cleanEmail.split('@')[0],
          phone: meta.phone || '',
          role: meta.role || 'customer',
          status: meta.role === 'operator' ? 'pending_approval' : 'active',
          city: meta.city || '',
          company_name: meta.company_name || null,
        };
      }

      // Check if suspended
      if (userProfile.status === 'suspended') {
        await supabase.auth.signOut();
        throw new Error('Your account has been suspended. Please contact administrator.');
      }

      // Verify portal compatibility
      if (expectedRole && userProfile.role !== expectedRole) {
        await supabase.auth.signOut();
        throw new Error(
          `Unauthorized: This portal is reserved for ${expectedRole.toUpperCase()} accounts. You are signed in as a ${userProfile.role.toUpperCase()}.`
        );
      }

      localStorage.removeItem('busgo_demo_session');
      setUser(data.user);
      setProfile(userProfile);
      return { user: data.user, profile: userProfile };
    }

    throw new Error('Invalid email or password. Please check your credentials or register a new account.');
  };

  // REGISTER CUSTOMER
  const registerCustomer = async ({ email, password, fullName, phone, city }) => {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      // Supabase signup with metadata
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone || null,
            city: city || null,
            role: 'customer',
          },
        },
      });

      if (error) {
        // If Supabase free tier email rate limit (3 emails/hr) is hit, provide seamless fallback
        if (error.message?.toLowerCase().includes('rate limit') || error.status === 429) {
          console.warn('Supabase email rate limit reached. Creating immediate session fallback.');
          const newCustomer = {
            id: `user-${Date.now()}`,
            email: cleanEmail,
            password,
            role: 'customer',
            status: 'active',
            full_name: fullName,
            phone: phone || '',
            city: city || '',
          };
          setDemoUsers((prev) => [...prev.filter((u) => u.email !== cleanEmail), newCustomer]);
          localStorage.setItem('busgo_demo_session', JSON.stringify(newCustomer));
          setUser({ id: newCustomer.id, email: newCustomer.email });
          setProfile(newCustomer);
          return { user: newCustomer, profile: newCustomer, requiresVerification: false, rateLimitFallback: true };
        }
        throw new Error(error.message);
      }

      const hasSession = Boolean(data?.session);
      if (hasSession && data.user) {
        setUser(data.user);
        const userProfile = await fetchSupabaseProfile(data.user.id, data.user.user_metadata, cleanEmail);
        setProfile(userProfile);
      }

      return { 
        user: data.user, 
        session: data.session, 
        requiresVerification: !hasSession 
      };
    } else {
      // Demo Mode Registration
      const exists = demoUsers.some((u) => u.email.toLowerCase() === cleanEmail);
      if (exists) {
        throw new Error('An account with this email address already exists.');
      }

      const newCustomer = {
        id: `demo-customer-${Date.now()}`,
        email: cleanEmail,
        password,
        role: 'customer',
        status: 'active',
        full_name: fullName,
        phone: phone || '',
        city: city || '',
      };

      setDemoUsers((prev) => [...prev, newCustomer]);
      localStorage.setItem('busgo_demo_session', JSON.stringify(newCustomer));
      setUser({ id: newCustomer.id, email: newCustomer.email });
      setProfile(newCustomer);
      return { user: newCustomer, profile: newCustomer, requiresVerification: false };
    }
  };

  // REGISTER OPERATOR (Requires Admin Approval)
  const registerOperator = async ({
    email,
    password,
    fullName,
    phone,
    companyName,
    fleetSize,
    registrationNumber,
    city,
  }) => {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
            company_name: companyName,
            fleet_size: parseInt(fleetSize, 10) || 1,
            registration_number: registrationNumber,
            city,
            role: 'operator',
          },
        },
      });

      if (error) {
        // If Supabase free tier email rate limit (3 emails/hr) is hit, provide seamless fallback
        if (error.message?.toLowerCase().includes('rate limit') || error.status === 429) {
          console.warn('Supabase operator signup rate limited. Creating immediate operator fallback.');
          const newOperator = {
            id: `demo-op-${Date.now()}`,
            email: cleanEmail,
            password,
            role: 'operator',
            status: 'pending_approval',
            full_name: fullName,
            phone,
            company_name: companyName,
            fleet_size: parseInt(fleetSize, 10) || 1,
            registration_number: registrationNumber,
            city,
          };
          setDemoUsers((prev) => [...prev.filter((u) => u.email !== cleanEmail), newOperator]);
          return { user: newOperator, requiresVerification: false, status: 'pending_approval' };
        }
        throw new Error(error.message);
      }

      return { user: data.user, requiresVerification: true, status: 'pending_approval' };
    } else {
      // Demo Mode Operator Registration
      const exists = demoUsers.some((u) => u.email.toLowerCase() === cleanEmail);
      if (exists) {
        throw new Error('An account with this email address already exists.');
      }

      const newOperator = {
        id: `demo-op-${Date.now()}`,
        email: cleanEmail,
        password,
        role: 'operator',
        status: 'pending_approval', // Gate: Pending Admin Approval!
        full_name: fullName,
        phone,
        company_name: companyName,
        fleet_size: parseInt(fleetSize, 10) || 1,
        registration_number: registrationNumber,
        city,
      };

      setDemoUsers((prev) => [...prev, newOperator]);
      // Note: We do not log them in automatically because they require admin approval!
      return { user: newOperator, status: 'pending_approval' };
    }
  };

  // UPDATE PROFILE
  const updateProfile = async (updates) => {
    if (!profile) return;

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.full_name,
          phone: updates.phone,
          city: updates.city,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw new Error(error.message);

      const refreshed = await fetchSupabaseProfile(user.id);
      setProfile(refreshed);
    } else {
      // Demo Mode Update
      const updatedUser = { ...profile, ...updates };
      setDemoUsers((prev) => prev.map((u) => (u.id === profile.id ? updatedUser : u)));
      setProfile(updatedUser);
      localStorage.setItem('busgo_demo_session', JSON.stringify(updatedUser));
    }
  };

  // LOGOUT
  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('busgo_demo_session');
    setUser(null);
    setProfile(null);
  };

  // FORGOT PASSWORD
  const resetPassword = async (email) => {
    const cleanEmail = email.trim().toLowerCase();
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw new Error(error.message);
    } else {
      // Demo simulation
      const found = demoUsers.some((u) => u.email.toLowerCase() === cleanEmail);
      if (!found) {
        throw new Error('No registered account found with this email address.');
      }
    }
    return true;
  };

  const value = {
    user,
    profile,
    role: profile?.role || 'customer',
    isAuthenticated: Boolean(user && profile),
    isApprovedOperator: profile?.role === 'operator' && profile?.status === 'active',
    isPendingOperator: profile?.role === 'operator' && profile?.status === 'pending_approval',
    isAdmin: profile?.role === 'admin' && profile?.status === 'active',
    isLoading,
    isDemoMode: !isSupabaseConfigured,
    login,
    registerCustomer,
    registerOperator,
    updateProfile,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
