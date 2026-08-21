import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, CheckCircle2 } from "lucide-react";
import { isBatchExpired } from "@/services/qrService";

interface BatchStatusBadgeProps {
  status: number;
  expDate: string;
}

export default function BatchStatusBadge({ status, expDate }: BatchStatusBadgeProps) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
  let label = "Valid";
  let Icon = CheckCircle2;

  const expired = isBatchExpired(expDate);

  if (status === 1) {
    variant = "secondary";
    label = "Flagged";
    Icon = AlertTriangle;
  } else if (status === 2 || expired) {
    variant = "destructive";
    label = "Expired";
    Icon = Calendar;
  }

  return (
    <Badge variant={variant} className="flex w-fit items-center gap-1.5 text-xs">
      <Icon className="h-3 w-3" />
      <span>{label}</span>
    </Badge>
  );
}
