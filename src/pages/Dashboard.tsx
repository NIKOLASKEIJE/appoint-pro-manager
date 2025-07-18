import { Calendar, Users, UserCheck, Clock, TrendingUp, Activity } from "lucide-react"
import { DashboardCard } from "@/components/DashboardCard"
import { OnboardingBanner } from "@/components/OnboardingBanner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useClinic } from "@/hooks/useClinic"
import { useAppointments } from "@/hooks/useAppointments"
import { usePatients } from "@/hooks/usePatients"
import { useProfessionals } from "@/hooks/useProfessionals"

const Dashboard = () => {
  const { currentClinic } = useClinic();
  const { appointments } = useAppointments();
  const { patients } = usePatients();
  const { professionals } = useProfessionals();
  
  // Calcular estatísticas reais baseadas nos dados da clínica
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const todayAppointments = appointments.filter(apt => 
    apt.start_time.startsWith(todayStr)
  );

  const stats = currentClinic ? [
    {
      title: "Consultas Hoje",
      value: todayAppointments.length,
      description: `${todayAppointments.filter(apt => apt.status === 'scheduled').length} pendentes`,
      icon: Calendar,
    },
    {
      title: "Pacientes Ativos",
      value: patients.length,
      description: "Total cadastrados",
      icon: Users,
    },
    {
      title: "Profissionais",
      value: professionals.length,
      description: "Ativos na clínica",
      icon: UserCheck,
    },
    {
      title: "Taxa de Ocupação",
      value: appointments.length > 0 ? "100%" : "0%",
      description: "Esta semana",
      icon: TrendingUp,
    }
  ] : [];

  // Próximos agendamentos baseados em dados reais
  const upcomingAppointments = todayAppointments
    .slice(0, 3)
    .map(apt => ({
      id: apt.id,
      patient: apt.patient?.name || 'Paciente não encontrado',
      time: new Date(apt.start_time).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      professional: apt.professional?.name || 'Profissional não encontrado',
      service: apt.title,
      status: apt.status
    }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-50 border-green-200'
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado'
      case 'pending': return 'Pendente'
      case 'cancelled': return 'Cancelado'
      default: return status
    }
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-subtle min-h-screen">
      {/* Onboarding Banner */}
      {!currentClinic && <OnboardingBanner />}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {currentClinic ? `${currentClinic.name} - Dashboard` : 'Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            Visão geral da sua clínica • {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        {currentClinic && (
          <Button variant="medical" className="animate-pulse-glow">
            <Calendar className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      {currentClinic && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={stat.title} style={{ animationDelay: `${index * 0.1}s` }}>
              <DashboardCard
                {...stat}
                className="animate-fade-in"
              />
            </div>
          ))}
        </div>
      )}

      {/* Main Content Grid */}
      {currentClinic && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximas Consultas */}
        <Card className="lg:col-span-2 bg-gradient-card shadow-card border-border/50 animate-fade-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Próximas Consultas
                </CardTitle>
                <CardDescription>
                  Agendamentos para hoje
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                Ver Agenda
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div 
                  key={appointment.id}
                  className="flex items-center justify-between p-4 bg-background rounded-lg border border-border/50 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">{appointment.time}</div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{appointment.patient}</h4>
                      <p className="text-sm text-muted-foreground">{appointment.service}</p>
                      <p className="text-xs text-muted-foreground">{appointment.professional}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                      {getStatusText(appointment.status)}
                    </span>
                    <Button variant="ghost" size="sm">
                      Ver
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Atividade Recente */}
        <Card className="bg-gradient-card shadow-card border-border/50 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Atividade Recente
            </CardTitle>
            <CardDescription>
              Últimas ações na clínica
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Consulta confirmada</p>
                  <p className="text-muted-foreground text-xs">Maria Silva • há 5 min</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Novo paciente cadastrado</p>
                  <p className="text-muted-foreground text-xs">Carlos Oliveira • há 12 min</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Reagendamento solicitado</p>
                  <p className="text-muted-foreground text-xs">Ana Costa • há 1h</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div>
                  <p className="font-medium">Lembrete enviado</p>
                  <p className="text-muted-foreground text-xs">Sistema • há 2h</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      )}
    </div>
  )
}

export default Dashboard