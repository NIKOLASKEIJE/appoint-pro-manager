import { useState } from 'react';
import { User, Phone, Mail, FileText, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePatients, CreatePatientData } from '@/hooks/usePatients';

const patientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cpf: z.string().min(11, 'CPF deve ter 11 dígitos').max(14, 'CPF inválido'),
  phone: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  birth_date: z.string().optional(),
  notes: z.string().optional(),
});

type PatientForm = z.infer<typeof patientSchema>;

interface PatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPatientCreated?: (patient: any) => void;
}

export function PatientModal({ open, onOpenChange, onPatientCreated }: PatientModalProps) {
  const { createPatient } = usePatients();
  const [creating, setCreating] = useState(false);

  const form = useForm<PatientForm>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      cpf: '',
      phone: '',
      email: '',
      birth_date: '',
      notes: '',
    },
  });

  const onSubmit = async (data: PatientForm) => {
    try {
      setCreating(true);
      const patientData: CreatePatientData = {
        name: data.name,
        cpf: data.cpf,
        phone: data.phone || undefined,
        email: data.email || undefined,
        birth_date: data.birth_date || undefined,
        notes: data.notes || undefined,
      };

      const newPatient = await createPatient(patientData);
      if (newPatient && onPatientCreated) {
        onPatientCreated(newPatient);
      }
      form.reset();
      onOpenChange(false);
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setCreating(false);
    }
  };

  const formatCPF = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara XXX.XXX.XXX-XX
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return numbers.slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Novo Paciente
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Cadastre um novo paciente no sistema
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nome Completo *
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Digite o nome completo" 
                      {...field}
                      className="bg-background"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    CPF *
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="000.000.000-00" 
                      {...field}
                      onChange={(e) => {
                        const formatted = formatCPF(e.target.value);
                        field.onChange(formatted);
                      }}
                      className="bg-background"
                      maxLength={14}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Telefone
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="(11) 99999-9999" 
                        {...field}
                        className="bg-background"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      E-mail
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="email@exemplo.com" 
                        {...field}
                        className="bg-background"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="birth_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data de Nascimento
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="date"
                      {...field}
                      className="bg-background"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Observações
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observações sobre o paciente..."
                      {...field}
                      className="bg-background resize-none"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={creating}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="medical"
                disabled={creating}
              >
                {creating ? 'Criando...' : 'Cadastrar Paciente'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}