import { useState, useMemo } from 'react';
import { format, addDays, subDays, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Appointment } from '@/hooks/useAppointments';

interface DailyCalendarProps {
  appointments: Appointment[];
  onDateClick?: (date: Date) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
  selectedProfessionalId?: string;
}

export function DailyCalendar({ 
  appointments, 
  onDateClick, 
  onAppointmentClick,
  selectedProfessionalId 
}: DailyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const filteredAppointments = useMemo(() => {
    let filtered = appointments;
    
    if (selectedProfessionalId && selectedProfessionalId !== "all") {
      filtered = filtered.filter(apt => apt.professional_id === selectedProfessionalId);
    }
    
    return filtered;
  }, [appointments, selectedProfessionalId]);

  const getDayAppointments = () => {
    return filteredAppointments.filter(appointment => {
      const appointmentDate = parseISO(appointment.start_time);
      return isSameDay(appointmentDate, currentDate);
    });
  };

  const previousDay = () => setCurrentDate(prev => subDays(prev, 1));
  const nextDay = () => setCurrentDate(prev => addDays(prev, 1));
  const goToToday = () => setCurrentDate(new Date());

  const timeSlots = Array.from({ length: 13 }, (_, i) => 8 + i); // 8 AM to 8 PM
  const dayAppointments = getDayAppointments();

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-foreground">
            {format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToToday}
            className="text-primary hover:bg-primary/10"
          >
            Hoje
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={previousDay}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextDay}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="bg-gradient-card border-border/50 shadow-card">
        <CardContent className="p-0">
          <div className="grid grid-cols-2 border-collapse">
            {/* Time column header */}
            <div className="p-4 border-b border-border/50 bg-muted/30">
              <span className="text-sm font-medium text-muted-foreground">Horário</span>
            </div>
            
            {/* Day header */}
            <div 
              className="p-4 border-b border-border/50 text-center cursor-pointer transition-colors hover:bg-accent/50 bg-primary/10"
              onClick={() => onDateClick?.(currentDate)}
            >
              <div className="text-sm font-medium text-primary">
                {format(currentDate, 'EEEE', { locale: ptBR })}
              </div>
              <div className="text-lg mt-1 text-primary">
                {format(currentDate, 'd')}
              </div>
            </div>

            {/* Time slots and appointments */}
            {timeSlots.map((hour) => {
              const hourAppointments = dayAppointments.filter(apt => {
                const aptHour = parseISO(apt.start_time).getHours();
                return aptHour === hour;
              });

              return (
                <div key={hour} className="contents">
                  {/* Time column */}
                  <div className="p-4 border-b border-border/30 bg-muted/20 text-center">
                    <span className="text-sm text-muted-foreground font-medium">
                      {hour.toString().padStart(2, '0')}:00
                    </span>
                  </div>
                  
                  {/* Day column */}
                  <div 
                    className="min-h-[80px] border-b border-border/30 p-2 relative cursor-pointer hover:bg-accent/30 transition-colors"
                    onClick={() => onDateClick?.(currentDate)}
                  >
                    {hourAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="text-sm p-3 rounded-lg mb-2 cursor-pointer transition-all hover:shadow-md animate-fade-in"
                        style={{ 
                          backgroundColor: appointment.professional?.color || '#3B82F6',
                          color: 'white',
                          opacity: 0.9
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAppointmentClick?.(appointment);
                        }}
                      >
                        <div className="font-semibold mb-2">
                          {appointment.title}
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4" />
                          <span>{appointment.patient?.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/90">
                          <Clock className="w-4 h-4" />
                          <span>
                            {format(parseISO(appointment.start_time), 'HH:mm')} - {format(parseISO(appointment.end_time), 'HH:mm')}
                          </span>
                        </div>
                        <div className="text-xs mt-1 text-white/80">
                          {appointment.professional?.name} - {appointment.professional?.specialty}
                        </div>
                      </div>
                    ))}
                    {hourAppointments.length === 0 && (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                        Clique para agendar
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}