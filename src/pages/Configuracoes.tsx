import { useState, useEffect } from "react";
import { Settings, Users, Shield, Trash2, Edit, Plus, UserCheck, Mail, Building2, Key, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserRoles } from "@/hooks/useUserRoles";
import { UserRoleModal } from "@/components/UserRoleModal";
import { ApiTokenModal } from "@/components/ApiTokenModal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [apiTokens, setApiTokens] = useState<any[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const { toast } = useToast();

  // Load API tokens
  const loadApiTokens = async () => {
    setLoadingTokens(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await supabase.functions.invoke('api-tokens-management', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setApiTokens(response.data || []);
    } catch (error) {
      console.error('Error loading tokens:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar tokens de API",
        variant: "destructive",
      });
    } finally {
      setLoadingTokens(false);
    }
  };

  useEffect(() => {
    loadApiTokens();
  }, []);

  const handleDeleteToken = async (tokenId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await supabase.functions.invoke(`api-tokens-management/${tokenId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: "Token removido",
        description: "Token de API removido com sucesso",
      });
      
      loadApiTokens();
    } catch (error) {
      console.error('Error deleting token:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover token",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
              
              {userRoles.length === 0 && !isClinicAdmin() && (
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

      {/* API Token Management */}
      {isClinicAdmin() && (
        <Card className="bg-gradient-card shadow-card border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" />
                  Tokens de API
                </CardTitle>
                <CardDescription>
                  Gerencie tokens para integração com sistemas externos como n8n
                </CardDescription>
              </div>
              <Button 
                onClick={() => setIsTokenModalOpen(true)}
                variant="medical"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Novo Token
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingTokens ? (
              <p className="text-muted-foreground">Carregando tokens...</p>
            ) : apiTokens.length === 0 ? (
              <p className="text-muted-foreground">Nenhum token criado ainda.</p>
            ) : (
              <div className="space-y-4">
                {apiTokens.map((token) => (
                  <div key={token.id} className="flex items-center justify-between p-4 border rounded-lg bg-background">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{token.name}</h4>
                        <Badge variant={token.is_active ? "default" : "secondary"}>
                          {token.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                        {token.expires_at && new Date(token.expires_at) < new Date() && (
                          <Badge variant="destructive">Expirado</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Token: <code className="bg-muted px-1 rounded text-xs">{token.token_preview}</code></p>
                        <p>Criado: {formatDate(token.created_at)}</p>
                        {token.last_used_at && (
                          <p>Último uso: {formatDate(token.last_used_at)}</p>
                        )}
                        {token.expires_at && (
                          <p>Expira: {formatDate(token.expires_at)}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteToken(token.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
                Acesso completo: pode gerenciar usuários, profissionais, pacientes, tokens de API e todos os agendamentos.
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

      <ApiTokenModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        onTokenCreated={loadApiTokens}
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