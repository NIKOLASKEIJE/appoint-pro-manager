import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserCheck, Palette } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProfessionals, CreateProfessionalData, Professional } from '@/hooks/useProfessionals';

const professionalSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  specialty: z.string().min(1, 'Especialidade é obrigatória'),
  color: z.string().min(1, 'Cor é obrigatória'),
});

type ProfessionalForm = z.infer<typeof professionalSchema>;

interface ProfessionalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professional?: Professional;
  onProfessionalCreated?: (professional: any) => void;
}

export function ProfessionalModal({ 
  open, 
  onOpenChange, 
  professional,
  onProfessionalCreated 
}: ProfessionalModalProps) {
  const { createProfessional, updateProfessional } = useProfessionals();
  const [creating, setCreating] = useState(false);

  const form = useForm<ProfessionalForm>({
    resolver: zodResolver(professionalSchema),
    defaultValues: {
      name: professional?.name || '',
      specialty: professional?.specialty || '',
      color: professional?.color || '#3B82F6',
    },
  });

  const onSubmit = async (data: ProfessionalForm) => {
    try {
      setCreating(true);
      
      const professionalData: CreateProfessionalData = {
        name: data.name,
        specialty: data.specialty,
        color: data.color,
      };
      
      if (professional) {
        // Editando profissional existente
        await updateProfessional(professional.id, professionalData);
      } else {
        // Criando novo profissional
        const newProfessional = await createProfessional(professionalData);
        if (newProfessional && onProfessionalCreated) {
          onProfessionalCreated(newProfessional);
        }
      }
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setCreating(false);
    }
  };

  const colors = [
    { value: '#3B82F6', label: 'Azul' },
    { value: '#10B981', label: 'Verde' },
    { value: '#8B5CF6', label: 'Roxo' },
    { value: '#F59E0B', label: 'Laranja' },
    { value: '#EF4444', label: 'Vermelho' },
    { value: '#06B6D4', label: 'Ciano' },
    { value: '#84CC16', label: 'Lima' },
    { value: '#F97316', label: 'Laranja Escuro' },
  ];


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-gradient-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" />
            {professional ? 'Editar Profissional' : 'Novo Profissional'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {professional ? 'Atualize os dados do profissional' : 'Adicione um novo membro à sua equipe'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Dr. João Silva" 
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
              name="specialty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especialidade</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Odontologia, Fisioterapia, Psicologia..."
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
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Cor do Profissional
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Selecionar cor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {colors.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full border border-border" 
                              style={{ backgroundColor: color.value }}
                            />
                            {color.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                {creating ? 'Salvando...' : (professional ? 'Atualizar' : 'Criar Profissional')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}