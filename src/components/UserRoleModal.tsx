import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserCheck, Shield, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUserRoles, CreateUserRoleData, UserRoleData } from '@/hooks/useUserRoles';
import { useProfessionals } from '@/hooks/useProfessionals';

const userRoleSchema = z.object({
  user_email: z.string().email('Email inválido'),
  role: z.enum(['clinic_admin', 'professional', 'receptionist'], {
    required_error: 'Papel é obrigatório',
  }),
  professional_id: z.string().optional(),
});

type UserRoleForm = z.infer<typeof userRoleSchema>;

interface UserRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRole?: UserRoleData;
}

export function UserRoleModal({ open, onOpenChange, userRole }: UserRoleModalProps) {
  const { createUserRole, updateUserRole } = useUserRoles();
  const { professionals } = useProfessionals();
  const [creating, setCreating] = useState(false);

  const form = useForm<UserRoleForm>({
    resolver: zodResolver(userRoleSchema),
    defaultValues: {
      user_email: '',
      role: 'professional',
      professional_id: userRole?.professional_id || '',
    },
  });

  const watchedRole = form.watch('role');

  const onSubmit = async (data: UserRoleForm) => {
    try {
      setCreating(true);
      
      const roleData: CreateUserRoleData = {
        user_email: data.user_email,
        role: data.role,
        professional_id: data.role === 'professional' ? data.professional_id : undefined,
      };
      
      if (userRole) {
        await updateUserRole(userRole.id, roleData);
      } else {
        await createUserRole(roleData);
      }
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setCreating(false);
    }
  };

  const roleLabels = {
    clinic_admin: 'Administrador da Clínica',
    professional: 'Profissional',
    receptionist: 'Recepcionista',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-gradient-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {userRole ? 'Editar Papel do Usuário' : 'Adicionar Usuário'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {userRole ? 'Atualize o papel do usuário na clínica' : 'Adicione um novo usuário à clínica'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="user_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email do Usuário
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="usuario@email.com" 
                      {...field}
                      className="bg-background"
                      disabled={!!userRole} // Disable when editing
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    Papel na Clínica
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Selecionar papel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(roleLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedRole === 'professional' && (
              <FormField
                control={form.control}
                name="professional_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profissional Associado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Selecionar profissional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {professionals.map((professional) => (
                          <SelectItem key={professional.id} value={professional.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: professional.color }}
                              />
                              {professional.name} - {professional.specialty}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
                {creating ? 'Salvando...' : (userRole ? 'Atualizar' : 'Adicionar Usuário')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}