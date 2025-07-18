import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useClinic } from './useClinic';
import { toast } from '@/hooks/use-toast';

export interface Patient {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  cpf?: string;
  birth_date?: string;
  clinic_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePatientData {
  name: string;
  cpf: string;
  phone?: string;
  email?: string;
  notes?: string;
  birth_date?: string;
}

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { currentClinic } = useClinic();

  const fetchPatients = async () => {
    if (!user || !currentClinic) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('clinic_id', currentClinic.id)
        .order('name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pacientes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPatient = async (patientData: CreatePatientData) => {
    if (!user || !currentClinic) return;

    try {
      const { data, error } = await supabase
        .from('patients')
        .insert({
          ...patientData,
          clinic_id: currentClinic.id
        })
        .select()
        .single();

      if (error) throw error;

      setPatients(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Paciente adicionado com sucesso!",
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar paciente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o paciente.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [user, currentClinic]);

  return {
    patients,
    loading,
    fetchPatients,
    createPatient,
  };
}