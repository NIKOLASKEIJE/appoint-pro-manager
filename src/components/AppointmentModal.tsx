import { useState } from 'react';
import { format, addHours } from 'date-fns';
import { CalendarIcon, Clock, User, UserCheck, Plus } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppointments, CreateAppointmentData } from '@/hooks/useAppointments';
import { useProfessionals } from '@/hooks/useProfessionals';
import { usePatients } from '@/hooks/usePatients';
import { PatientModal } from './PatientModal';

const appointmentSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  patient_id: z.string().min(1, 'Paciente é obrigatório'),
  professional_id: z.string().min(1, 'Profissional é obrigatório'),
  date: z.date({
    required_error: 'Data é obrigatória',
  }),
  start_time: z.string().min(1, 'Horário de início é obrigatório'),
  duration: z.string().min(1, 'Duração é obrigatória'),
});

type AppointmentForm = z.infer<typeof appointmentSchema>;

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
}

export function AppointmentModal({ open, onOpenChange, selectedDate }: AppointmentModalProps) {
  const { createAppointment, creating } = useAppointments();
  const { professionals } = useProfessionals();
  const { patients } = usePatients();
  const [showPatientModal, setShowPatientModal] = useState(false);

  const form = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      title: '',
      patient_id: '',
      professional_id: '',
      date: selectedDate || new Date(),
      start_time: '',
      duration: '60', // 60 minutes default
    },
  });

  const onSubmit = async (data: AppointmentForm) => {
    try {
      const startDateTime = new Date(data.date);
      const [hours, minutes] = data.start_time.split(':');
      startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + parseInt(data.duration));

      const appointmentData: CreateAppointmentData = {
        title: data.title,
        patient_id: data.patient_id,
        professional_id: data.professional_id,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
      };

      await createAppointment(appointmentData);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const timeSlots = Array.from({ length: 20 }, (_, i) => {
    const hour = 8 + i; // Start from 8 AM
    return {
      value: `${hour.toString().padStart(2, '0')}:00`,
      label: `${hour.toString().padStart(2, '0')}:00`,
    };
  });

  const durations = [
    { value: '30', label: '30 minutos' },
    { value: '60', label: '1 hora' },
    { value: '90', label: '1h 30min' },
    { value: '120', label: '2 horas' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            Novo Agendamento
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Preencha os dados do agendamento
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Consulta de rotina" 
                      {...field}
                      className="bg-background"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="patient_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Paciente
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Selecionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <div className="p-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full justify-center mb-2"
                            onClick={() => setShowPatientModal(true)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Cadastrar Novo Paciente
                          </Button>
                        </div>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="professional_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      Profissional
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Selecionar" />
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
            </div>

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal bg-background",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>Selecionar data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Horário
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Selecionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot.value} value={slot.value}>
                            {slot.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Selecionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {durations.map((duration) => (
                          <SelectItem key={duration.value} value={duration.value}>
                            {duration.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                {creating ? 'Criando...' : 'Criar Agendamento'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
      
      <PatientModal
        open={showPatientModal}
        onOpenChange={setShowPatientModal}
        onPatientCreated={(patient) => {
          form.setValue('patient_id', patient.id);
        }}
      />
    </Dialog>
  );
}