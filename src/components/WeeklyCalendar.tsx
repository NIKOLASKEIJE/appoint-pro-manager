import { useState, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay, isToday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Appointment } from '@/hooks/useAppointments';

interface WeeklyCalendarProps {
  appointments: Appointment[];
  onDateClick?: (date: Date) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
  selectedProfessionalId?: string;
}

export function WeeklyCalendar({ 
  appointments, 
  onDateClick, 
  onAppointmentClick,
  selectedProfessionalId 
}: WeeklyCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekStart = startOfWeek(currentWeek, { locale: ptBR });
  const weekEnd = endOfWeek(currentWeek, { locale: ptBR });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const filteredAppointments = useMemo(() => {
    let filtered = appointments;
    
    if (selectedProfessionalId && selectedProfessionalId !== "all") {
      filtered = filtered.filter(apt => apt.professional_id === selectedProfessionalId);
    }
    
    return filtered;
  }, [appointments, selectedProfessionalId]);

  const getAppointmentsForDay = (date: Date) => {
    return filteredAppointments.filter(appointment => {
      const appointmentDate = parseISO(appointment.start_time);
      return isSameDay(appointmentDate, date);
    });
  };

  const previousWeek = () => setCurrentWeek(prev => subWeeks(prev, 1));
  const nextWeek = () => setCurrentWeek(prev => addWeeks(prev, 1));
  const goToToday = () => setCurrentWeek(new Date());

  const timeSlots = Array.from({ length: 13 }, (_, i) => 8 + i); // 8 AM to 8 PM

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-foreground">
            {format(weekStart, "d 'de' MMMM", { locale: ptBR })} - {format(weekEnd, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
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
          <Button variant="outline" size="icon" onClick={previousWeek}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextWeek}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="bg-gradient-card border-border/50 shadow-card">
        <CardContent className="p-0">
          <div className="grid grid-cols-8 border-collapse">
            {/* Time column header */}
            <div className="p-4 border-b border-border/50 bg-muted/30">
              <span className="text-sm font-medium text-muted-foreground">Horário</span>
            </div>
            
            {/* Day headers */}
            {weekDays.map((day) => (
              <div 
                key={day.toISOString()} 
                className={cn(
                  "p-4 border-b border-border/50 text-center cursor-pointer transition-colors hover:bg-accent/50",
                  isToday(day) && "bg-primary/10 text-primary font-semibold"
                )}
                onClick={() => onDateClick?.(day)}
              >
                <div className="text-sm font-medium">
                  {format(day, 'EEE', { locale: ptBR })}
                </div>
                <div className={cn(
                  "text-lg mt-1",
                  isToday(day) ? "text-primary" : "text-foreground"
                )}>
                  {format(day, 'd')}
                </div>
              </div>
            ))}

            {/* Time slots and appointments */}
            {timeSlots.map((hour) => (
              <div key={hour} className="contents">
                {/* Time column */}
                <div className="p-2 border-b border-border/30 bg-muted/20 text-center">
                  <span className="text-sm text-muted-foreground">
                    {hour.toString().padStart(2, '0')}:00
                  </span>
                </div>
                
                {/* Day columns */}
                {weekDays.map((day) => {
                  const dayAppointments = getAppointmentsForDay(day);
                  const hourAppointments = dayAppointments.filter(apt => {
                    const aptHour = parseISO(apt.start_time).getHours();
                    return aptHour === hour;
                  });

                  return (
                    <div 
                      key={`${day.toISOString()}-${hour}`}
                      className="min-h-[60px] border-b border-r border-border/30 p-1 relative cursor-pointer hover:bg-accent/30 transition-colors"
                      onClick={() => onDateClick?.(day)}
                    >
                      {hourAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="text-xs p-2 rounded-md mb-1 cursor-pointer transition-all hover:shadow-sm animate-fade-in"
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
                          <div className="font-medium truncate">
                            {appointment.title}
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-white/80">
                            <User className="w-3 h-3" />
                            <span className="truncate">
                              {appointment.patient?.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-white/80">
                            <Clock className="w-3 h-3" />
                            <span>
                              {format(parseISO(appointment.start_time), 'HH:mm')} - {format(parseISO(appointment.end_time), 'HH:mm')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}