import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface GameFormLayoutProps {
  action: (formData: FormData) => void;
  title: string;
  description: string;
  submitButtonText: string;
  children: React.ReactNode;
}

export function GameFormLayout({
  action,
  title,
  description,
  submitButtonText,
  children,
}: GameFormLayoutProps) {
  return (
    <form action={action} encType="multipart/form-data" className="p-4 sm:p-6 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {children}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" size="lg">
            {submitButtonText}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}