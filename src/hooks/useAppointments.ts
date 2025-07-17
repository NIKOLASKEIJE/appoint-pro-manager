import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useClinic } from './useClinic';
import { toast } from '@/hooks/use-toast';

export interface Appointment {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  status: string;
  patient_id: string;
  professional_id: string;
  clinic_id: string;
  created_at: string;
  updated_at: string;
  patient?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  professional?: {
    id: string;
    name: string;
    specialty: string;
    color: string;
  };
}

export interface CreateAppointmentData {
  title: string;
  start_time: string;
  end_time: string;
  patient_id: string;
  professional_id: string;
  status?: string;
}

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();
  const { currentClinic } = useClinic();

  const fetchAppointments = async () => {
    if (!user || !currentClinic) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(id, name, phone, email),
          professional:professionals(id, name, specialty, color)
        `)
        .eq('clinic_id', currentClinic.id)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os agendamentos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (appointmentData: CreateAppointmentData) => {
    if (!user || !currentClinic) return;

    try {
      setCreating(true);
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          ...appointmentData,
          clinic_id: currentClinic.id,
          status: appointmentData.status || 'scheduled'
        })
        .select(`
          *,
          patient:patients(id, name, phone, email),
          professional:professionals(id, name, specialty, color)
        `)
        .single();

      if (error) throw error;

      setAppointments(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Agendamento criado com sucesso!",
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o agendamento.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setCreating(false);
    }
  };

  const updateAppointment = async (id: string, updates: Partial<CreateAppointmentData>) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          patient:patients(id, name, phone, email),
          professional:professionals(id, name, specialty, color)
        `)
        .single();

      if (error) throw error;

      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === id ? data : appointment
        )
      );

      toast({
        title: "Sucesso",
        description: "Agendamento atualizado com sucesso!",
      });

      return data;
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o agendamento.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAppointments(prev => prev.filter(appointment => appointment.id !== id));
      toast({
        title: "Sucesso",
        description: "Agendamento excluído com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o agendamento.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user, currentClinic]);

  return {
    appointments,
    loading,
    creating,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
  };
}