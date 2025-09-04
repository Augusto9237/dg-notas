import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { CircleUser } from "lucide-react";
import Link from "next/link";
import { Button } from "./button";
import { Logo } from "./logo";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Card, CardDescription, CardTitle } from "./card";

export default function Header() {
  return (
    <div
      className="bg-primary text-card px-5 py-4"
    >
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="h-12 w-12 border-2 border-secondary">
          <AvatarImage src="/api/placeholder/48/48" />
          <AvatarFallback className="bg-background text-primary font-medium">
            MR
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-lg">Olá, Maria!</h1>
          <p className="text-sm opacity-90">
            Bons estudos hoje 📚
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center bg-card/10 rounded-lg backdrop-blur-sm border-none gap-1 p-2">
          <CardTitle className="text-lg font-bold text-secondary">
            8.5
          </CardTitle>
          <CardDescription className="text-xs opacity-90 text-card">Média Geral</CardDescription>
        </Card>

        <Card className="text-center bg-card/10 rounded-lg backdrop-blur-sm border-none gap-1 p-2">
          <CardTitle className="text-lg font-bold text-secondary">
            12
          </CardTitle>
          <CardDescription className="text-xs opacity-90 text-card">Redações</CardDescription>
        </Card>

        <Card className="text-center bg-card/10 rounded-lg backdrop-blur-sm border-none gap-1 p-2">
          <CardTitle className="text-lg font-bold text-secondary">
            10
          </CardTitle>
          <CardDescription className="text-xs opacity-90 text-card">Mentorias</CardDescription>
        </Card>
      </div>
    </div>
  );
}
