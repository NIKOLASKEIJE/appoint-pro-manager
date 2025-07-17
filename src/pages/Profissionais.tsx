import { UserCheck, Plus, Search, Edit, Trash2, Mail, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const Profissionais = () => {
  // Mock data - em produção viria do Supabase
  const professionals = [
    {
      id: 1,
      name: "Dr. João Santos",
      specialty: "Odontologia",
      email: "joao.santos@clinica.com",
      color: "#3B82F6",
      status: "ativo",
      workingDays: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"],
      appointments: 15
    },
    {
      id: 2,
      name: "Dra. Ana Costa",
      specialty: "Fisioterapia",
      email: "ana.costa@clinica.com",
      color: "#10B981",
      status: "ativo",
      workingDays: ["Segunda", "Quarta", "Sexta"],
      appointments: 8
    },
    {
      id: 3,
      name: "Dr. Pedro Alves",
      specialty: "Estética",
      email: "pedro.alves@clinica.com",
      color: "#8B5CF6",
      status: "ativo",
      workingDays: ["Terça", "Quinta", "Sábado"],
      appointments: 12
    },
    {
      id: 4,
      name: "Dra. Maria Fernandes",
      specialty: "Odontologia",
      email: "maria.fernandes@clinica.com",
      color: "#F59E0B",
      status: "afastado",
      workingDays: [],
      appointments: 0
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800 border-green-200'
      case 'afastado': return 'bg-red-100 text-red-800 border-red-200'
      case 'ferias': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSpecialtyColor = (specialty: string) => {
    switch (specialty) {
      case 'Odontologia': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Fisioterapia': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'Estética': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-subtle min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profissionais</h1>
          <p className="text-muted-foreground">
            Gerencie a equipe da sua clínica
          </p>
        </div>
        <Button variant="medical">
          <Plus className="w-4 h-4 mr-2" />
          Novo Profissional
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="bg-gradient-card shadow-card border-border/50">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar profissionais por nome ou especialidade..." 
                className="w-full pl-10"
              />
            </div>
            <Button variant="outline">
              Filtrar Especialidade
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Professionals List */}
      <Card className="bg-gradient-card shadow-card border-border/50 animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" />
            Equipe
          </CardTitle>
          <CardDescription>
            {professionals.length} profissionais cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {professionals.map((professional) => (
              <div 
                key={professional.id}
                className="flex items-center justify-between p-4 bg-background rounded-lg border border-border/50 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${professional.color}20`, border: `2px solid ${professional.color}` }}
                  >
                    <span className="font-semibold" style={{ color: professional.color }}>
                      {professional.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground">{professional.name}</h4>
                      <Badge className={`text-xs ${getStatusColor(professional.status)}`}>
                        {professional.status}
                      </Badge>
                      <Badge className={`text-xs ${getSpecialtyColor(professional.specialty)}`}>
                        {professional.specialty}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {professional.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {professional.appointments} consultas hoje
                      </span>
                    </div>
                    {professional.workingDays.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Dias de trabalho: {professional.workingDays.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Calendar className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {professionals.length === 0 && (
        <Card className="bg-gradient-card shadow-card border-border/50">
          <CardContent className="py-12">
            <div className="text-center">
              <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum profissional cadastrado</h3>
              <p className="text-muted-foreground mb-4">
                Comece adicionando membros à sua equipe
              </p>
              <Button variant="medical">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Profissional
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Profissionais