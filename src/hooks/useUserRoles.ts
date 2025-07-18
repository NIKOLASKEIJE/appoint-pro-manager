import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useClinic } from './useClinic';
import { toast } from '@/hooks/use-toast';

export type UserRole = 'clinic_admin' | 'professional' | 'receptionist';

export interface UserRoleData {
  id: string;
  user_id: string;
  clinic_id: string;
  role: UserRole;
  professional_id?: string;
  created_at: string;
  updated_at: string;
  profile?: {
    full_name: string;
    created_by?: string;
  };
}

export interface CreateUserRoleData {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  professional_id?: string;
}

export function useUserRoles() {
  const [userRoles, setUserRoles] = useState<UserRoleData[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { currentClinic } = useClinic();

  const fetchUserRoles = async () => {
    if (!user || !currentClinic) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // First get user roles
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('clinic_id', currentClinic.id);

      if (userRolesError) throw userRolesError;

      if (!userRolesData || userRolesData.length === 0) {
        setUserRoles([]);
        setCurrentUserRole(null);
        setLoading(false);
        return;
      }

      // Get all user IDs to fetch profiles
      const userIds = userRolesData.map(role => role.user_id);
      
      // Fetch profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, created_by')
        .in('user_id', userIds);

      if (profilesError) {
        console.warn('Erro ao buscar perfis:', profilesError);
      }

      // Combine user roles with profiles
      const transformedData = userRolesData.map(role => ({
        ...role,
        profile: profilesData?.find(profile => profile.user_id === role.user_id) || undefined
      }));
      
      setUserRoles(transformedData);

      // Get current user's role
      const currentRole = transformedData?.find(role => role.user_id === user.id);
      setCurrentUserRole(currentRole?.role || null);
    } catch (error) {
      console.error('Erro ao buscar papéis dos usuários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os papéis dos usuários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createUserRole = async (roleData: CreateUserRoleData) => {
    if (!user || !currentClinic) return;

    try {
      // Special case for self-promotion to admin
      if (roleData.email === 'current-user') {
        const { data, error } = await supabase.rpc('assign_self_as_admin', {
          p_clinic_id: currentClinic.id
        });

        if (error) throw error;

        if (data) {
          await fetchUserRoles();
          toast({
            title: "Sucesso",
            description: "Você agora é administrador da clínica!",
          });
        } else {
          toast({
            title: "Aviso",
            description: "Esta clínica já possui um administrador.",
            variant: "destructive",
          });
        }
        return;
      }

      // Create user via edge function
      const { data, error } = await supabase.functions.invoke('create-clinic-user', {
        body: {
          email: roleData.email,
          password: roleData.password,
          full_name: roleData.full_name,
          clinic_id: currentClinic.id,
          role: roleData.role,
          professional_id: roleData.professional_id,
        },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      // Refresh the user roles list
      await fetchUserRoles();
      
      toast({
        title: "Sucesso",
        description: `Usuário ${roleData.full_name} criado com sucesso!`,
      });

      return data.user;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível criar o usuário.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateUserRole = async (id: string, updates: Partial<CreateUserRoleData>) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setUserRoles(prev =>
        prev.map(role => role.id === id ? data : role)
      );

      toast({
        title: "Sucesso",
        description: "Papel do usuário atualizado com sucesso!",
      });

      return data;
    } catch (error) {
      console.error('Erro ao atualizar papel do usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o papel do usuário.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteUserRole = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setUserRoles(prev => prev.filter(role => role.id !== id));
      toast({
        title: "Sucesso",
        description: "Papel do usuário removido com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao remover papel do usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o papel do usuário.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const isClinicAdmin = () => currentUserRole === 'clinic_admin';
  const isProfessional = () => currentUserRole === 'professional';
  const isReceptionist = () => currentUserRole === 'receptionist';

  useEffect(() => {
    if (user && currentClinic) {
      fetchUserRoles();
      
      // Setup real-time subscription
      const channel = supabase
        .channel('user-roles-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_roles',
            filter: `clinic_id=eq.${currentClinic.id}`
          },
          (payload) => {
            console.log('Real-time user role change:', payload);
            fetchUserRoles();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setLoading(false);
      setUserRoles([]);
      setCurrentUserRole(null);
    }
  }, [user?.id, currentClinic?.id]);

  return {
    userRoles,
    currentUserRole,
    loading,
    fetchUserRoles,
    createUserRole,
    updateUserRole,
    deleteUserRole,
    isClinicAdmin,
    isProfessional,
    isReceptionist,
  };
}