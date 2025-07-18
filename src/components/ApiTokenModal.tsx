import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Eye, EyeOff } from "lucide-react";

interface ApiTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTokenCreated: () => void;
}

export function ApiTokenModal({ isOpen, onClose, onTokenCreated }: ApiTokenModalProps) {
  const [name, setName] = useState("");
  const [expiresInDays, setExpiresInDays] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do token é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Usuário não autenticado");
      }

      const response = await supabase.functions.invoke('api-tokens-management', {
        body: {
          name: name.trim(),
          expiresInDays: expiresInDays ? parseInt(expiresInDays) : null
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setCreatedToken(response.data.token);
      toast({
        title: "Token criado",
        description: "Token de API criado com sucesso. Copie-o agora, pois não será mostrado novamente.",
      });
      
      onTokenCreated();
    } catch (error) {
      console.error('Error creating token:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar token",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToken = () => {
    if (createdToken) {
      navigator.clipboard.writeText(createdToken);
      toast({
        title: "Copiado",
        description: "Token copiado para a área de transferência",
      });
    }
  };

  const handleClose = () => {
    setName("");
    setExpiresInDays("");
    setCreatedToken(null);
    setShowToken(false);
    onClose();
  };

  if (createdToken) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Token de API criado</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Importante:</strong> Este token não será mostrado novamente. Copie-o agora e guarde em local seguro.
              </p>
              
              <div className="flex items-center space-x-2">
                <div className="flex-1 font-mono text-sm bg-background p-2 rounded border">
                  {showToken ? createdToken : "•".repeat(64)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyToken}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleClose}>Fechar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Token de API</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Token</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Integração n8n"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expires">Expiração</Label>
            <Select value={expiresInDays} onValueChange={setExpiresInDays}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a expiração" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nunca expira</SelectItem>
                <SelectItem value="30">30 dias</SelectItem>
                <SelectItem value="90">90 dias</SelectItem>
                <SelectItem value="365">1 ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Token"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}