import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from '@/hooks/use-toast';

interface Clinic {
  id: string;
  name: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

interface UserClinic {
  id: string;
  user_id: string;
  clinic_id: string;
  role: string;
  role_type: string;
  created_at: string;
}

export function useClinic() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [currentClinic, setCurrentClinic] = useState<Clinic | null>(null);
  const [userClinics, setUserClinics] = useState<UserClinic[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUserClinics = async () => {
    if (!user) return;

    try {
      // Fetch user-clinic associations
      const { data: userClinicsData, error: userClinicsError } = await supabase
        .from('user_clinics')
        .select('*')
        .eq('user_id', user.id);

      if (userClinicsError) throw userClinicsError;
      setUserClinics(userClinicsData || []);

      // Fetch actual clinic data
      if (userClinicsData && userClinicsData.length > 0) {
        const clinicIds = userClinicsData.map(uc => uc.clinic_id);
        const { data: clinicsData, error: clinicsError } = await supabase
          .from('clinics')
          .select('*')
          .in('id', clinicIds);

        if (clinicsError) throw clinicsError;
        setClinics(clinicsData || []);

        // Set the first clinic as current if none is selected
        if (clinicsData && clinicsData.length > 0 && !currentClinic) {
          setCurrentClinic(clinicsData[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching clinics:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as clínicas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createClinic = async (name: string, address?: string) => {
    if (!user) return;

    try {
      // Create clinic
      const { data: clinicData, error: clinicError } = await supabase
        .from('clinics')
        .insert({ name, address })
        .select()
        .single();

      if (clinicError) throw clinicError;

      // Create user-clinic association with master role
      const { error: userClinicError } = await supabase
        .from('user_clinics')
        .insert({
          user_id: user.id,
          clinic_id: clinicData.id,
          role: 'admin',
          role_type: 'master'
        });

      if (userClinicError) throw userClinicError;

      // Update local state
      setClinics(prev => [...prev, clinicData]);
      setCurrentClinic(clinicData);

      toast({
        title: "Sucesso",
        description: "Clínica criada com sucesso!",
      });

      return clinicData;
    } catch (error) {
      console.error('Error creating clinic:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a clínica.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const isMasterUser = () => {
    if (!currentClinic || !user) return false;
    const userClinic = userClinics.find(uc => 
      uc.clinic_id === currentClinic.id && uc.user_id === user.id
    );
    return userClinic?.role_type === 'master';
  };

  const hasNoClinics = clinics.length === 0 && !loading;

  useEffect(() => {
    fetchUserClinics();
  }, [user]);

  return {
    clinics,
    currentClinic,
    setCurrentClinic,
    userClinics,
    loading,
    hasNoClinics,
    isMasterUser,
    createClinic,
    refetch: fetchUserClinics,
  };
}