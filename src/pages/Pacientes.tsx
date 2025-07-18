import { useState } from 'react';
import { Users, Plus, Search, Edit, Trash2, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { usePatients } from '@/hooks/usePatients';
import { PatientModal } from '@/components/PatientModal';

const Pacientes = () => {
  const { patients, loading } = usePatients();
  const [showPatientModal, setShowPatientModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800 border-green-200'
      case 'inativo': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-subtle min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pacientes</h1>
          <p className="text-muted-foreground">
            Gerencie todos os pacientes da sua clínica
          </p>
        </div>
        <Button variant="medical" onClick={() => setShowPatientModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Paciente
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="bg-gradient-card shadow-card border-border/50">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar pacientes por nome, telefone ou email..." 
                className="w-full pl-10"
              />
            </div>
            <Button variant="outline">
              Filtrar Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patients List */}
      <Card className="bg-gradient-card shadow-card border-border/50 animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Lista de Pacientes
          </CardTitle>
          <CardDescription>
            {patients.length} pacientes cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">Carregando pacientes...</div>
            </div>
          ) : (
            <div className="space-y-4">
              {patients.map((patient) => (
                <div 
                  key={patient.id}
                  className="flex items-center justify-between p-4 bg-background rounded-lg border border-border/50 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {patient.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">{patient.name}</h4>
                        <Badge className="text-xs bg-green-100 text-green-800 border-green-200">
                          ativo
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {patient.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {patient.phone}
                          </span>
                        )}
                        {patient.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {patient.email}
                          </span>
                        )}
                      </div>
                      {patient.birth_date && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Nascimento: {new Date(patient.birth_date).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                      {patient.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          {patient.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
          )}
        </CardContent>
      </Card>

      {/* Empty State Placeholder (quando não houver pacientes) */}
      {patients.length === 0 && (
        <Card className="bg-gradient-card shadow-card border-border/50">
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum paciente cadastrado</h3>
              <p className="text-muted-foreground mb-4">
                Comece adicionando seu primeiro paciente
              </p>
              <Button variant="medical" onClick={() => setShowPatientModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Paciente
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <PatientModal
        open={showPatientModal}
        onOpenChange={setShowPatientModal}
      />
    </div>
  )
}

export default Pacientes