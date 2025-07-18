import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay, isToday, parseISO, isSameMonth, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Appointment } from '@/hooks/useAppointments';

interface MonthlyCalendarProps {
  appointments: Appointment[];
  onDateClick?: (date: Date) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
  selectedProfessionalId?: string;
}

export function MonthlyCalendar({ 
  appointments, 
  onDateClick, 
  onAppointmentClick,
  selectedProfessionalId 
}: MonthlyCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  // Get the calendar grid including previous/next month days
  const calendarStart = startOfWeek(monthStart, { locale: ptBR });
  const calendarEnd = endOfWeek(monthEnd, { locale: ptBR });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

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

  const previousMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const nextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-foreground">
            {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
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
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="bg-gradient-card border-border/50 shadow-card">
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-collapse">
            {/* Day headers */}
            {weekDays.map((day) => (
              <div 
                key={day}
                className="p-4 border-b border-border/50 text-center bg-muted/30"
              >
                <span className="text-sm font-medium text-muted-foreground">{day}</span>
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((day) => {
              const dayAppointments = getAppointmentsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              
              return (
                <div 
                  key={day.toISOString()}
                  className={cn(
                    "min-h-[120px] border-b border-r border-border/30 p-2 cursor-pointer hover:bg-accent/30 transition-colors",
                    !isCurrentMonth && "bg-muted/20 text-muted-foreground",
                    isToday(day) && isCurrentMonth && "bg-primary/10"
                  )}
                  onClick={() => onDateClick?.(day)}
                >
                  {/* Day number */}
                  <div className={cn(
                    "text-sm font-medium mb-2",
                    isToday(day) && isCurrentMonth ? "text-primary" : 
                    isCurrentMonth ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {format(day, 'd')}
                  </div>
                  
                  {/* Appointments */}
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 3).map((appointment) => (
                      <div
                        key={appointment.id}
                        className="text-xs p-1 rounded cursor-pointer transition-all hover:shadow-sm animate-fade-in"
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
                          {format(parseISO(appointment.start_time), 'HH:mm')} {appointment.title}
                        </div>
                        <div className="truncate text-white/80">
                          {appointment.patient?.name}
                        </div>
                      </div>
                    ))}
                    
                    {/* Show "+X more" if there are more appointments */}
                    {dayAppointments.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayAppointments.length - 3} mais
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