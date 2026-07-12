"use client";

/**
 * UserMenu — dropdown menu for authenticated users shown in navbar.
 *
 * Shows: Avatar, Username (header), Dashboard, Profile, Settings, Logout.
 * Session-aware: pulls user data from useUserStore + useAuthStore.
 */
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LayoutDashboard, User, Settings, LogOut } from "lucide-react";
import { useNavigationStore, useUserStore, useAuthStore } from "@/stores";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

function UserAvatar({
  name,
  avatar,
  size = "sm",
}: {
  name: string;
  avatar?: string | null;
  size?: "sm" | "md";
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const dim = size === "sm" ? "size-8" : "size-10";
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className={cn(dim, "rounded-full object-cover ring-1 ring-border")}
      />
    );
  }
  return (
    <span
      className={cn(
        dim,
        "rounded-full bg-[linear-gradient(135deg,var(--electric),var(--purple-brand))] flex items-center justify-center text-white text-xs font-bold ring-1 ring-electric/20"
      )}
    >
      {initials || "U"}
    </span>
  );
}

export function UserMenu() {
  const navigate = useNavigationStore((s) => s.navigate);
  const user = useUserStore();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    logout();
    try {
      await signOut({ redirect: false });
    } catch {
      // ignore — store already cleared
    }
    navigate("home");
  };

  const displayName = user.fullName || "LootLoom Member";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="User menu"
        className="inline-flex items-center gap-2 h-10 pl-1.5 pr-2 rounded-xl glass-2 ring-1 ring-border hover:glass-3 transition-all focus:outline-none focus:ring-2 focus:ring-electric/40"
      >
        <UserAvatar name={displayName} avatar={user.avatar} size="sm" />
        <span className="hidden sm:inline text-sm font-semibold text-foreground max-w-[120px] truncate">
          {displayName.split(" ")[0]}
        </span>
        <ChevronDown size={14} className="text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[220px] rounded-xl glass-nav ring-1 ring-border/60 p-1.5"
      >
        <DropdownMenuLabel className="flex items-center gap-2.5 px-2 py-2">
          <UserAvatar name={displayName} avatar={user.avatar} size="md" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {displayName}
            </p>
            {user.email && (
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/60 my-1" />
        <DropdownMenuItem
          onClick={() => navigate("dashboard")}
          className="rounded-lg px-2 py-1.5 text-sm cursor-pointer flex items-center gap-2.5 focus:bg-accent/60"
        >
          <LayoutDashboard size={14} className="text-electric" />
          <span>Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate("profile")}
          className="rounded-lg px-2 py-1.5 text-sm cursor-pointer flex items-center gap-2.5 focus:bg-accent/60"
        >
          <User size={14} className="text-cyan-brand" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate("settings")}
          className="rounded-lg px-2 py-1.5 text-sm cursor-pointer flex items-center gap-2.5 focus:bg-accent/60"
        >
          <Settings size={14} className="text-purple-brand" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border/60 my-1" />
        <DropdownMenuItem
          onClick={handleLogout}
          className="rounded-lg px-2 py-1.5 text-sm cursor-pointer flex items-center gap-2.5 focus:bg-accent/60 text-rose-brand"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
