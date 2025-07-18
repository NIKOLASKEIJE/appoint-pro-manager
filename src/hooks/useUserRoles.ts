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
}

export interface CreateUserRoleData {
  user_email: string;
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
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('clinic_id', currentClinic.id);

      if (error) throw error;
      setUserRoles(data || []);

      // Get current user's role
      const currentRole = data?.find(role => role.user_id === user.id);
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
      // For now, we'll ask the admin to provide the user_id directly
      // In a real implementation, you would need admin permissions to list users
      toast({
        title: "Aviso",
        description: "Para adicionar usuários, eles devem primeiro se registrar no sistema e fornecer seu ID de usuário.",
        variant: "destructive",
      });
      return;

      /* 
      // This would work with admin permissions:
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
      if (userError) throw userError;

      const targetUser = userData.users.find(u => u.email === roleData.user_email);
      if (!targetUser) {
        toast({
          title: "Erro",
          description: "Usuário não encontrado com este email.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: targetUser.id,
          clinic_id: currentClinic.id,
          role: roleData.role,
          professional_id: roleData.professional_id,
        })
        .select()
        .single();

      if (error) throw error;

      setUserRoles(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Papel do usuário criado com sucesso!",
      });

      return data;
      */
    } catch (error) {
      console.error('Erro ao criar papel do usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o papel do usuário.",
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