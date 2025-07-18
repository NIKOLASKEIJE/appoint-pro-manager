import { useState } from 'react';
import { UserCheck, Plus, Search, Edit, Trash2, Mail, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useProfessionals, Professional } from '@/hooks/useProfessionals';
import { ProfessionalModal } from '@/components/ProfessionalModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Profissionais = () => {
  const { professionals, loading, deleteProfessional } = useProfessionals();
  const [showProfessionalModal, setShowProfessionalModal] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | undefined>();
  const [deletingProfessional, setDeletingProfessional] = useState<Professional | undefined>();

  const handleEditProfessional = (professional: Professional) => {
    setEditingProfessional(professional);
    setShowProfessionalModal(true);
  };

  const handleDeleteProfessional = async () => {
    if (deletingProfessional) {
      await deleteProfessional(deletingProfessional.id);
      setDeletingProfessional(undefined);
    }
  };

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
        <Button variant="medical" onClick={() => setShowProfessionalModal(true)}>
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
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">Carregando profissionais...</div>
            </div>
          ) : (
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
                        <Badge className="text-xs bg-green-100 text-green-800 border-green-200">
                          ativo
                        </Badge>
                        <Badge className={`text-xs ${getSpecialtyColor(professional.specialty)}`}>
                          {professional.specialty}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          {professional.specialty}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Calendar className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditProfessional(professional)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeletingProfessional(professional)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
              <Button variant="medical" onClick={() => setShowProfessionalModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Profissional
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <ProfessionalModal
        open={showProfessionalModal}
        onOpenChange={(open) => {
          setShowProfessionalModal(open);
          if (!open) setEditingProfessional(undefined);
        }}
        professional={editingProfessional}
      />

      <AlertDialog open={!!deletingProfessional} onOpenChange={() => setDeletingProfessional(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Profissional</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o profissional {deletingProfessional?.name}? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProfessional}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Profissionais