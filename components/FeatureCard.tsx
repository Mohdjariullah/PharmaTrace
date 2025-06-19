import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DivideIcon as LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient?: string;
}

export default function FeatureCard({ icon: Icon, title, description, gradient = "from-blue-500 to-purple-600" }: FeatureCardProps) {
  return (
    <Card className="group transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/25 hover:-translate-y-2 border-2 hover:border-purple-200 dark:hover:border-purple-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="relative mb-6">
          <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity`}></div>
          <div className={`relative w-16 h-16 bg-gradient-to-r ${gradient} rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-xl group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}