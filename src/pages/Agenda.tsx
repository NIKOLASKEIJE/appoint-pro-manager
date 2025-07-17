import { Calendar, Plus, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const Agenda = () => {
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
        <Button variant="medical">
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
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtros Avançados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Placeholder */}
      <Card className="bg-gradient-card shadow-card border-border/50 animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Calendário Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
            <div className="text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Calendário em Desenvolvimento</h3>
              <p className="text-muted-foreground mb-4">
                O calendário interativo será implementado em breve
              </p>
              <Button variant="medical">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Agendamento
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Agenda