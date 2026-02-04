import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AppRole } from '../types/admin';

interface AdminAuthState {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: (requiredRole: AppRole | AppRole[]) => boolean;
}

export function useAdminAuth(): AdminAuthState {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer role fetch with setTimeout
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setRole(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
        setRole(null);
      } else {
        setRole(data?.role as AppRole ?? null);
      }
    } catch (err) {
      console.error('Error in fetchUserRole:', err);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  const hasRole = (requiredRole: AppRole | AppRole[]): boolean => {
    if (!role) return false;
    
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    // Admin tem acesso a tudo
    if (role === 'admin') return true;
    
    // Editor-chefe tem acesso a editor e revisor
    if (role === 'editor_chefe' && roles.some(r => ['editor_chefe', 'editor', 'revisor'].includes(r))) {
      return true;
    }
    
    return roles.includes(role);
  };

  return {
    user,
    session,
    role,
    isLoading,
    isAuthenticated: !!session && !!role,
    hasRole,
  };
}

// Hook para sign in
export async function signInAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  // Verificar se tem role
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', data.user.id)
    .maybeSingle();

  if (roleError) {
    throw roleError;
  }

  if (!roleData) {
    await supabase.auth.signOut();
    throw new Error('Utilizador não tem permissões de acesso ao backoffice.');
  }

  return { user: data.user, role: roleData.role as AppRole };
}

// Hook para sign out
export async function signOutAdmin() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
