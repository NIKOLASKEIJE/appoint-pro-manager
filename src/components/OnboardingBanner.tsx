import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useClinic } from '@/hooks/useClinic';
import { useToast } from '@/hooks/use-toast';

export function OnboardingBanner() {
  const [showForm, setShowForm] = useState(false);
  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const { createClinic } = useClinic();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const clinic = await createClinic(clinicName, clinicAddress);
    
    if (clinic) {
      toast({
        title: "Sucesso!",
        description: "Clínica criada com sucesso.",
      });
      setShowForm(false);
    } else {
      toast({
        title: "Erro",
        description: "Erro ao criar clínica. Tente novamente.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  if (showForm) {
    return (
      <Card className="mb-6 border-primary">
        <CardHeader>
          <CardTitle>Configure sua clínica</CardTitle>
          <CardDescription>
            Vamos começar criando o perfil da sua clínica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clinicName">Nome da clínica</Label>
              <Input
                id="clinicName"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                placeholder="Ex: Clínica Odontológica Sorriso"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clinicAddress">Endereço</Label>
              <Input
                id="clinicAddress"
                value={clinicAddress}
                onChange={(e) => setClinicAddress(e.target.value)}
                placeholder="Ex: Rua das Flores, 123 - Centro"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Criando...' : 'Criar clínica'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-primary bg-primary/5">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Bem-vindo ao ClinicFlow!</h3>
            <p className="text-sm text-muted-foreground">
              Configure sua clínica para começar a gerenciar seus agendamentos.
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            Configurar clínica
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}