import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useClinic } from './useClinic';
import { toast } from '@/hooks/use-toast';

export interface Professional {
  id: string;
  name: string;
  specialty: string;
  color: string;
  clinic_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProfessionalData {
  name: string;
  specialty: string;
  color?: string;
}

export function useProfessionals() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { currentClinic } = useClinic();

  const fetchProfessionals = async () => {
    if (!user || !currentClinic) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('clinic_id', currentClinic.id)
        .order('name');

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os profissionais.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProfessional = async (professionalData: CreateProfessionalData) => {
    if (!user || !currentClinic) return;

    try {
      const { data, error } = await supabase
        .from('professionals')
        .insert({
          ...professionalData,
          clinic_id: currentClinic.id,
          color: professionalData.color || '#3B82F6'
        })
        .select()
        .single();

      if (error) throw error;

      setProfessionals(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Profissional adicionado com sucesso!",
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar profissional:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o profissional.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProfessional = async (id: string, professionalData: Partial<CreateProfessionalData>) => {
    if (!user || !currentClinic) return;

    try {
      const { data, error } = await supabase
        .from('professionals')
        .update(professionalData)
        .eq('id', id)
        .eq('clinic_id', currentClinic.id)
        .select()
        .single();

      if (error) throw error;

      setProfessionals(prev => prev.map(p => p.id === id ? data : p));
      toast({
        title: "Sucesso",
        description: "Profissional atualizado com sucesso!",
      });

      return data;
    } catch (error) {
      console.error('Erro ao atualizar profissional:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o profissional.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteProfessional = async (id: string) => {
    if (!user || !currentClinic) return;

    try {
      const { error } = await supabase
        .from('professionals')
        .delete()
        .eq('id', id)
        .eq('clinic_id', currentClinic.id);

      if (error) throw error;

      setProfessionals(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Sucesso",
        description: "Profissional removido com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao excluir profissional:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o profissional.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    if (user && currentClinic) {
      fetchProfessionals();
      
      // Setup real-time subscription
      const channel = supabase
        .channel('professionals-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'professionals',
            filter: `clinic_id=eq.${currentClinic.id}`
          },
          (payload) => {
            console.log('Real-time professional change:', payload);
            fetchProfessionals();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setLoading(false);
      setProfessionals([]);
    }
  }, [user?.id, currentClinic?.id]);

  return {
    professionals,
    loading,
    fetchProfessionals,
    createProfessional,
    updateProfessional,
    deleteProfessional,
  };
}