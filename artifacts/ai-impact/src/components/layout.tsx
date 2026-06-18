import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Activity, BookOpen, Clock, Leaf, Plus, Target, FileText, BookOpenText, GitCompare, LogOut, LogIn, Shield, Scale, Settings, Sparkles } from "lucide-react";
import { Show, useUser, useClerk } from "@clerk/react";
import { SiteFooter } from "@/components/site-footer";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const protectedNav = [
    { href: "/", label: "Dashboard", icon: Activity },
    { href: "/log", label: "Log Session", icon: Plus },
    { href: "/goals", label: "Goals", icon: Target },
    { href: "/history", label: "History", icon: Clock },
    { href: "/compare", label: "Compare Tools", icon: GitCompare },
    { href: "/report", label: "Weekly Report", icon: FileText },
    { href: "/practice", label: "My Practice", icon: Sparkles },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const publicNav = [
    { href: "/tools", label: "Tool Catalog", icon: BookOpen },
    { href: "/methodology", label: "Methodology", icon: BookOpenText },
    { href: "/privacy", label: "Privacy", icon: Shield },
    { href: "/responsibility", label: "Responsible Use", icon: Scale },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <aside className="w-full md:w-64 border-b md:border-r border-border bg-card flex flex-col">
        <Link href="/">
          <div className="p-6 flex items-center gap-3 cursor-pointer hover:bg-accent/40 transition-colors">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-semibold tracking-tight">AI Impact</h1>
              <p className="text-xs text-muted-foreground font-mono">Tracker v1.4</p>
            </div>
          </div>
        </Link>

        <nav className="flex-1 px-4 pb-4 md:py-4 flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible">
          <Show when="signed-in">
            {protectedNav.map((item) => (
              <NavLink key={item.href} item={item} active={location === item.href} />
            ))}
            <div className="hidden md:block h-px bg-border my-2" />
          </Show>
          {publicNav.map((item) => (
            <NavLink key={item.href} item={item} active={location === item.href} />
          ))}
        </nav>

        <div className="hidden md:block border-t border-border p-4">
          <Show when="signed-in">
            <UserChip />
          </Show>
          <Show when="signed-out">
            <Link href="/sign-in">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Sign in
              </button>
            </Link>
          </Show>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full flex flex-col">
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </main>
    </div>
  );
}

function NavLink({
  item,
  active,
}: {
  item: { href: string; label: string; icon: React.ComponentType<{ className?: string }> };
  active: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      <Icon className="w-4 h-4" />
      {item.label}
    </Link>
  );
}

function UserChip() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  if (!isLoaded) {
    return <div className="h-10 bg-muted/40 rounded-md animate-pulse" />;
  }

  const name =
    user?.fullName || user?.primaryEmailAddress?.emailAddress?.split("@")[0] || "Account";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0 overflow-hidden">
        {user?.imageUrl ? (
          <img src={user.imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          initial
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{name}</div>
      </div>
      <button
        type="button"
        onClick={() => signOut({ redirectUrl: basePath || "/" })}
        title="Sign out"
        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
