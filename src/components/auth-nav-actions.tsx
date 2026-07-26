"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon } from "lucide-react";
import { useStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AuthNavActionsProps = {
  showPoints?: boolean;
  sellButtonClassName?: string;
};

export function AuthNavActions({ showPoints = true, sellButtonClassName }: AuthNavActionsProps) {
  const { currentUser, currentAdmin, sessionType, logout, loading } = useStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (loading) {
    return <div className="h-9 w-28 animate-pulse rounded-full bg-secondary" aria-hidden="true" />;
  }

  const isAdmin = sessionType === "admin" && !!currentAdmin;
  const isUser = sessionType === "user" && !!currentUser;

  if (!isAdmin && !isUser) {
    return (
      <Button
        size="sm"
        className={sellButtonClassName ?? "border-0 bg-maple text-tuft hover:bg-maple/90"}
        onClick={() => router.push("/auth?mode=register")}
      >
        Sell what you got
      </Button>
    );
  }

  const account = isAdmin ? currentAdmin! : currentUser!;
  const firstName = account.name.split(" ")[0];

  return (
    <>
      {isUser && showPoints && (
        <Badge variant="secondary" className="hidden bg-secondary text-secondary-foreground sm:inline-flex">
          {currentUser!.points} pts
        </Badge>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-maple text-[10px] font-bold text-tuft">
              {account.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </span>
            <span className="hidden sm:inline">{firstName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>{isAdmin ? "Admin" : currentUser!.role}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {isAdmin ? (
            <DropdownMenuItem onClick={() => router.push("/admin")}>Admin dashboard</DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuItem onClick={() => router.push("/dashboard")}>Dashboard</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/sellers/${currentUser!.id}`)}>
                My profile
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem asChild>
            <Link href="/">Home</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="outline" size="sm" className="gap-2" onClick={handleLogout}>
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Log out</span>
      </Button>
    </>
  );
}
