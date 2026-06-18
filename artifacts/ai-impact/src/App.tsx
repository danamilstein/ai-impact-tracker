import { useEffect, useRef } from "react";
import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, Show, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GridProvider } from "@/contexts/grid-context";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import Tools from "@/pages/tools";
import History from "@/pages/history";
import LogSession from "@/pages/log";
import Goals from "@/pages/goals";
import Report from "@/pages/report";
import Practice from "@/pages/practice";
import Receipt from "@/pages/receipt";
import Methodology from "@/pages/methodology";
import BookmarkletPage from "@/pages/bookmarklet";
import ImportPage from "@/pages/import";
import Privacy from "@/pages/privacy";
import About from "@/pages/about";
import Responsibility from "@/pages/responsibility";
import Compare from "@/pages/compare";
import Settings from "@/pages/settings";
import InsightsPreview from "@/pages/insights-preview";
import Landing from "@/pages/landing";
import SignInPage from "@/pages/sign-in";
import SignUpPage from "@/pages/sign-up";

const queryClient = new QueryClient();

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in environment");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(160 84% 39%)",
    colorForeground: "hsl(222 47% 11%)",
    colorMutedForeground: "hsl(215 16% 47%)",
    colorDanger: "hsl(0 84% 60%)",
    colorBackground: "hsl(0 0% 100%)",
    colorInput: "hsl(0 0% 100%)",
    colorInputForeground: "hsl(222 47% 11%)",
    colorNeutral: "hsl(214 32% 91%)",
    fontFamily: "'Outfit', system-ui, sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-card rounded-2xl w-[440px] max-w-full overflow-hidden border border-border shadow-sm",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-foreground font-semibold",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButton: "border-border hover:bg-accent",
    socialButtonsBlockButtonText: "text-foreground font-medium",
    formFieldLabel: "text-foreground font-medium",
    formFieldInput: "bg-background border-border text-foreground",
    formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
    footerActionLink: "text-primary hover:text-primary/80 font-medium",
    footerActionText: "text-muted-foreground",
    dividerText: "text-muted-foreground",
    dividerLine: "bg-border",
    identityPreviewEditButton: "text-primary",
    formFieldSuccessText: "text-primary",
    alertText: "text-foreground",
    logoBox: "h-10",
    logoImage: "h-10 w-auto",
  },
};

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function HomeRoute() {
  return (
    <>
      <Show when="signed-in">
        <Layout>
          <Dashboard />
        </Layout>
      </Show>
      <Show when="signed-out">
        <Landing />
      </Show>
    </>
  );
}

function Protected({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Show when="signed-in">
        <Layout>{children}</Layout>
      </Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  );
}

function PublicWithLayout({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRoute} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route path="/log">{() => <Protected><LogSession /></Protected>}</Route>
      <Route path="/goals">{() => <Protected><Goals /></Protected>}</Route>
      <Route path="/history">{() => <Protected><History /></Protected>}</Route>
      <Route path="/compare">{() => <Protected><Compare /></Protected>}</Route>
      <Route path="/report">{() => <Protected><Report /></Protected>}</Route>
      <Route path="/practice">{() => <Protected><Practice /></Protected>}</Route>
      <Route path="/receipt">{() => <Protected><Receipt /></Protected>}</Route>
      <Route path="/settings">{() => <Protected><Settings /></Protected>}</Route>
      {import.meta.env.DEV && <Route path="/insights-preview">{() => <InsightsPreview />}</Route>}
      <Route path="/tools">{() => <PublicWithLayout><Tools /></PublicWithLayout>}</Route>
      <Route path="/methodology">{() => <PublicWithLayout><Methodology /></PublicWithLayout>}</Route>
      <Route path="/bookmarklet">{() => <PublicWithLayout><BookmarkletPage /></PublicWithLayout>}</Route>
      <Route path="/import">{() => <PublicWithLayout><ImportPage /></PublicWithLayout>}</Route>
      <Route path="/privacy">{() => <PublicWithLayout><Privacy /></PublicWithLayout>}</Route>
      <Route path="/about">{() => <PublicWithLayout><About /></PublicWithLayout>}</Route>
      <Route path="/responsibility">{() => <PublicWithLayout><Responsibility /></PublicWithLayout>}</Route>
      <Route>{() => <PublicWithLayout><NotFound /></PublicWithLayout>}</Route>
    </Switch>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <GridProvider>
            <Router />
            <Toaster />
          </GridProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
