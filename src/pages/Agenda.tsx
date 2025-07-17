import { useState } from "react"
import { Calendar, Plus, Filter, Search, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WeeklyCalendar } from "@/components/WeeklyCalendar"
import { AppointmentModal } from "@/components/AppointmentModal"
import { useAppointments } from "@/hooks/useAppointments"
import { useProfessionals } from "@/hooks/useProfessionals"

const Agenda = () => {
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>("")
  
  const { appointments, loading } = useAppointments()
  const { professionals } = useProfessionals()

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setShowAppointmentModal(true)
  }

  const handleNewAppointment = () => {
    setSelectedDate(undefined)
    setShowAppointmentModal(true)
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-subtle min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agenda</h1>
          <p className="text-muted-foreground">
            Gerencie todos os agendamentos da sua clínica
          </p>
        </div>
        <Button variant="medical" onClick={handleNewAppointment}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-card shadow-card border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
          <CardDescription>Encontre agendamentos específicos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por paciente..." 
                className="w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedProfessionalId} onValueChange={setSelectedProfessionalId}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Todos os profissionais" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os profissionais</SelectItem>
                  {professionals.map((professional) => (
                    <SelectItem key={professional.id} value={professional.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: professional.color }}
                        />
                        {professional.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card className="bg-gradient-card shadow-card border-border/50 animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Calendário Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando agendamentos...</p>
              </div>
            </div>
          ) : (
            <WeeklyCalendar
              appointments={appointments}
              onDateClick={handleDateClick}
              selectedProfessionalId={selectedProfessionalId}
            />
          )}
        </CardContent>
      </Card>

      <AppointmentModal
        open={showAppointmentModal}
        onOpenChange={setShowAppointmentModal}
        selectedDate={selectedDate}
      />
    </div>
  )
}

export default Agenda