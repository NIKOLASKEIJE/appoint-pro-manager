import { Settings, Users, Shield, Building2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useClinic } from "@/hooks/useClinic"

const Configuracoes = () => {
  const { isMasterUser } = useClinic()

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Clinic Settings */}
        <Card className="bg-gradient-card shadow-card border-border/50 hover:shadow-elevated transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Clínica
            </CardTitle>
            <CardDescription>
              Informações básicas da clínica
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Editar Informações
            </Button>
          </CardContent>
        </Card>

        {/* User Management - Only for Master Users */}
        {isMasterUser() && (
          <Card className="bg-gradient-card shadow-card border-border/50 hover:shadow-elevated transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Usuários
              </CardTitle>
              <CardDescription>
                Gerenciar acesso de usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="medical" className="w-full">
                Gerenciar Usuários
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Security Settings - Only for Master Users */}
        {isMasterUser() && (
          <Card className="bg-gradient-card shadow-card border-border/50 hover:shadow-elevated transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Segurança
              </CardTitle>
              <CardDescription>
                Configurações de segurança
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Configurar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* General Settings */}
        <Card className="bg-gradient-card shadow-card border-border/50 hover:shadow-elevated transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Geral
            </CardTitle>
            <CardDescription>
              Configurações gerais do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Personalizar
            </Button>
          </CardContent>
        </Card>
      </div>

      {isMasterUser() && (
        <Card className="bg-gradient-card shadow-card border-border/50">
          <CardHeader>
            <CardTitle className="text-primary">Privilégios de Conta Master</CardTitle>
            <CardDescription>
              Como conta master, você tem acesso completo a todas as funcionalidades:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Shield className="w-4 h-4 text-primary" />
              Criar e gerenciar contas de usuários
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Users className="w-4 h-4 text-primary" />
              Definir permissões e níveis de acesso
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Settings className="w-4 h-4 text-primary" />
              Configurar todas as definições da clínica
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Building2 className="w-4 h-4 text-primary" />
              Acesso completo a relatórios e dados
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Configuracoes