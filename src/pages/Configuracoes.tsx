import { useState } from "react";
import { Settings, Users, Shield, Trash2, Edit, Plus, UserCheck, Mail, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserRoles } from "@/hooks/useUserRoles";
import { UserRoleModal } from "@/components/UserRoleModal";
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

const Configuracoes = () => {
  const { userRoles, loading, deleteUserRole, isClinicAdmin, createUserRole } = useUserRoles();
  const [showUserRoleModal, setShowUserRoleModal] = useState(false);
  const [editingUserRole, setEditingUserRole] = useState(undefined);
  const [deletingUserRole, setDeletingUserRole] = useState(undefined);

  const handleEditUserRole = (userRole: any) => {
    setEditingUserRole(userRole);
    setShowUserRoleModal(true);
  };

  const handleDeleteUserRole = async () => {
    if (deletingUserRole) {
      await deleteUserRole(deletingUserRole.id);
      setDeletingUserRole(undefined);
    }
  };

  const handleBecomeAdmin = async () => {
    // Simple mechanism for first user to become admin
    try {
      await createUserRole({
        email: 'current-user', // Special flag for self-promotion
        password: '',
        full_name: '',
        role: 'clinic_admin',
      });
    } catch (error) {
      console.error('Error becoming admin:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'clinic_admin': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'professional': return 'bg-green-100 text-green-800 border-green-200';
      case 'receptionist': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'clinic_admin': return 'Administrador';
      case 'professional': return 'Profissional';
      case 'receptionist': return 'Recepcionista';
      default: return role;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-subtle min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações da sua clínica
          </p>
        </div>
      </div>

      {/* User Management Section */}
      <Card className="bg-gradient-card shadow-card border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Gerenciamento de Usuários
              </CardTitle>
              <CardDescription>
                Controle quem tem acesso à sua clínica e seus papéis
              </CardDescription>
            </div>
            {isClinicAdmin() && (
              <Button 
                variant="medical" 
                onClick={() => setShowUserRoleModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Usuário
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">Carregando usuários...</div>
            </div>
          ) : (
            <div className="space-y-4">
              {userRoles.map((userRole) => (
                <div 
                  key={userRole.id}
                  className="flex items-center justify-between p-4 bg-background rounded-lg border border-border/50 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">
                          {userRole.profile?.full_name || `Usuário ${userRole.user_id.substring(0, 8)}...`}
                        </span>
                        <Badge className={`text-xs ${getRoleColor(userRole.role)}`}>
                          {getRoleLabel(userRole.role)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          ID: {userRole.user_id.substring(0, 8)}...
                        </span>
                        {userRole.professional_id && (
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-3 h-3" />
                            Profissional vinculado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {isClinicAdmin() && (
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditUserRole(userRole)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeletingUserRole(userRole)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              
              {userRoles.length === 0 && (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Nenhum usuário configurado
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Como primeiro usuário, você pode se tornar administrador da clínica
                  </p>
                  <Button 
                    variant="medical" 
                    onClick={handleBecomeAdmin}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Tornar-me Administrador
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permissions Info */}
      <Card className="bg-gradient-card shadow-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Níveis de Acesso
          </CardTitle>
          <CardDescription>
            Entenda os diferentes papéis e suas permissões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Administrador da Clínica
              </h4>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Acesso completo: pode gerenciar usuários, profissionais, pacientes e todos os agendamentos.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                Profissional
              </h4>
              <p className="text-green-700 dark:text-green-300 text-sm">
                Pode ver e editar apenas seus próprios agendamentos e pacientes.
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                Recepcionista
              </h4>
              <p className="text-purple-700 dark:text-purple-300 text-sm">
                Pode gerenciar agendamentos e pacientes, mas não pode criar ou editar profissionais.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <UserRoleModal
        open={showUserRoleModal}
        onOpenChange={(open) => {
          setShowUserRoleModal(open);
          if (!open) setEditingUserRole(undefined);
        }}
        userRole={editingUserRole}
      />

      <AlertDialog open={!!deletingUserRole} onOpenChange={() => setDeletingUserRole(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este usuário da clínica? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUserRole}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Configuracoes