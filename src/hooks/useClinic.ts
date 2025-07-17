import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

interface Clinic {
  id: string;
  name: string;
  address: string;
}

export function useClinic() {
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserClinic();
    }
  }, [user]);

  const fetchUserClinic = async () => {
    try {
      const { data: userClinics, error } = await supabase
        .from('user_clinics')
        .select(`
          clinic_id,
          clinics (
            id,
            name,
            address
          )
        `)
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching clinic:', error);
        return;
      }

      if (userClinics?.clinics) {
        setClinic(userClinics.clinics as Clinic);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createClinic = async (name: string, address: string) => {
    if (!user) return null;

    try {
      // Create clinic
      const { data: clinic, error: clinicError } = await supabase
        .from('clinics')
        .insert([{ name, address }])
        .select()
        .single();

      if (clinicError) throw clinicError;

      // Associate user with clinic
      const { error: userClinicError } = await supabase
        .from('user_clinics')
        .insert([{ 
          user_id: user.id, 
          clinic_id: clinic.id,
          role: 'admin'
        }]);

      if (userClinicError) throw userClinicError;

      setClinic(clinic);
      return clinic;
    } catch (error) {
      console.error('Error creating clinic:', error);
      return null;
    }
  };

  return {
    clinic,
    loading,
    createClinic,
    refetch: fetchUserClinic
  };
}