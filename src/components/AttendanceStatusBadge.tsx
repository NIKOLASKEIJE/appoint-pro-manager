import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Check, X, Calendar, RotateCcw, Clock } from "lucide-react";
import { useAppointments } from "@/hooks/useAppointments";

interface AttendanceStatusBadgeProps {
  appointmentId: string;
  currentStatus?: string;
  editable?: boolean;
}

const statusConfig = {
  scheduled: {
    label: "Agendado",
    icon: Clock,
    color: "default" as const
  },
  attended: {
    label: "Compareceu",
    icon: Check,
    color: "default" as const
  },
  no_show: {
    label: "Não compareceu",
    icon: X,
    color: "destructive" as const
  },
  cancelled: {
    label: "Cancelado",
    icon: X,
    color: "secondary" as const
  },
  rescheduled: {
    label: "Remarcado",
    icon: RotateCcw,
    color: "outline" as const
  }
};

export function AttendanceStatusBadge({ 
  appointmentId, 
  currentStatus = 'scheduled', 
  editable = true 
}: AttendanceStatusBadgeProps) {
  const { updateAttendanceStatus } = useAppointments();
  const config = statusConfig[currentStatus as keyof typeof statusConfig] || statusConfig.scheduled;
  const Icon = config.icon;

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateAttendanceStatus(appointmentId, newStatus);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  if (!editable) {
    return (
      <Badge variant={config.color} className="flex items-center gap-1">
        <Icon size={12} />
        {config.label}
      </Badge>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Badge 
          variant={config.color} 
          className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Icon size={12} />
          {config.label}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(statusConfig).map(([status, statusInfo]) => {
          const StatusIcon = statusInfo.icon;
          return (
            <DropdownMenuItem
              key={status}
              onClick={() => handleStatusChange(status)}
              className="flex items-center gap-2"
            >
              <StatusIcon size={14} />
              {statusInfo.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}