import { cn } from "@/lib/utils";

interface PageHeaderProps {
  heading: string;
  text?: string | null;
  className?: string;
}

export function PageHeader({ heading, text, className }: PageHeaderProps) {
  return (
    <div className={cn("grid gap-1", className)}>
      <h1 className="text-3xl font-bold tracking-tight">{heading}</h1>
      {text && <p className="text-lg text-muted-foreground">{text}</p>}
    </div>
  );
}