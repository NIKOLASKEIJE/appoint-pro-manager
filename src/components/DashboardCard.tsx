import { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function DashboardCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  className = ""
}: DashboardCardProps) {
  return (
    <Card className={`bg-gradient-card border-border/50 shadow-card hover:shadow-elevated transition-all duration-200 animate-fade-in ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="flex items-center gap-2 text-xs">
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
          {trend && (
            <span 
              className={`flex items-center gap-1 font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}