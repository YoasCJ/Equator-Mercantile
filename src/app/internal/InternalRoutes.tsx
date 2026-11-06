import { useEffect, useState, type FormEvent } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { ArrowLeft, LayoutDashboard, LogOut, Search, UsersRound } from "lucide-react";
import { Link, Navigate, NavLink, Outlet, Route, Routes, useLocation, useMatch } from "react-router";
import { Button } from "../components/ui/button";
import { BuyerCrm, Overview } from "./BuyerCrm";
import { BuyerFinder } from "./BuyerFinder";
import { supabase } from "./supabase";
import "./internal.css";

function WorkspaceMessage({ children }: { children: React.ReactNode }) {
  return (
    <main className="workspace workspace-center">
      <section className="workspace-card workspace-login">{children}</section>
    </main>
  );
}

function BackToWebsite() {
  return <Link className="workspace-back" to="/"><ArrowLeft size={16} /> Back to website</Link>;
}

function Login({ client }: { client: SupabaseClient }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      const { error } = await client.auth.signInWithPassword({
        email: String(form.get("email")).trim(),
        password: String(form.get("password")),
      });
      if (error) setError("Sign-in failed. Check your credentials or try again in a moment.");
    } catch {
      setError("Could not connect. Try again in a moment.");
    } finally {
      setPending(false);
    }
  }

  return (
    <WorkspaceMessage>
      <BackToWebsite />
      <img className="workspace-logo" src="/equator-logo.png" alt="" />
      <p className="workspace-eyebrow">Equator Mercantile Indonesia</p>
      <h1>Team sign in</h1>
      <p className="workspace-muted">Access the internal buyer workspace with your team account.</p>
      <form className="workspace-form" onSubmit={signIn}>
        <label>Email<input name="email" type="email" autoComplete="username" required /></label>
        <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
        {error && <p role="alert" className="workspace-error">{error}</p>}
        <Button disabled={pending}>{pending ? "Signing in…" : "Sign in"}</Button>
      </form>
    </WorkspaceMessage>
  );
}

function DashboardAccess({ client, session }: { client: SupabaseClient; session: Session }) {
  const userId = session.user.id;
  const [access, setAccess] = useState<"loading" | "admin" | "staff" | "denied" | "error">("loading");
  const [check, setCheck] = useState(0);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");

  useEffect(() => {
    const request = new AbortController();
    async function loadMembership() {
      try {
        const { data, error } = await client.from("crm_members").select("role")
          .eq("user_id", userId).abortSignal(request.signal).maybeSingle();
        if (!request.signal.aborted) setAccess(error ? "error" : data?.role ?? "denied");
      } catch {
        if (!request.signal.aborted) setAccess("error");
      }
    }
    void loadMembership();
    return () => request.abort();
  }, [client, userId, check]);

  async function signOut() {
    setSigningOut(true);
    setSignOutError("");
    try {
      const { error } = await client.auth.signOut({ scope: "local" });
      if (error) throw error;
    } catch {
      setSignOutError("Sign-out failed. Please try again.");
    } finally {
      setSigningOut(false);
    }
  }

  const logout = (
    <Button variant="outline" onClick={signOut} disabled={signingOut}>
      <LogOut size={16} /> {signingOut ? "Signing out…" : "Sign out"}
    </Button>
  );

  if (access === "loading") return <WorkspaceMessage><p role="status">Checking team access…</p></WorkspaceMessage>;
  if (access === "denied" || access === "error") {
    return (
      <WorkspaceMessage>
        <BackToWebsite />
        <h1>{access === "denied" ? "Team access required" : "Could not check team access"}</h1>
        <p className="workspace-muted">
          {access === "denied" ? "Ask an Equator administrator to grant access to your account." : "Try checking your access again."}
        </p>
        {signOutError && <p role="alert" className="workspace-error">{signOutError}</p>}
        <div className="workspace-actions">
          {access === "error" && <Button onClick={() => { setAccess("loading"); setCheck(check + 1); }}>Retry</Button>}
          {logout}
        </div>
      </WorkspaceMessage>
    );
  }

  return (
    <div className="workspace">
      <header className="workspace-header">
        <div className="workspace-header-inner">
          <Link className="workspace-brand" to="/dashboard">
            <img src="/equator-logo.png" alt="" />
            <span>Equator <small>Command Center</small></span>
          </Link>
          <nav aria-label="Workspace" className="workspace-nav">
            <NavLink to="/dashboard" end><LayoutDashboard size={16} /> Overview</NavLink>
            <NavLink to="/dashboard/buyers"><UsersRound size={16} /> Buyer CRM</NavLink>
            <NavLink to="/dashboard/finder"><Search size={16} /> Buyer Finder</NavLink>
          </nav>
          {logout}
        </div>
      </header>
      <main className="workspace-main">
        {signOutError && <p role="alert" className="workspace-error">{signOutError}</p>}
        <Outlet />
      </main>
    </div>
  );
}

function AuthenticatedRoutes({ client }: { client: SupabaseClient }) {
  const [session, setSession] = useState<Session | null | undefined>();
  const location = useLocation();
  const isLogin = useMatch("/login");

  useEffect(() => {
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => subscription.unsubscribe();
  }, [client]);

  if (session === undefined) return <WorkspaceMessage><p role="status">Loading session…</p></WorkspaceMessage>;
  if (isLogin) {
    const requested = location.state?.next;
    const next = requested === "/dashboard/buyers" || requested === "/dashboard/finder"
      ? requested
      : "/dashboard";
    return session ? <Navigate replace to={next} /> : <Login client={client} />;
  }
  if (!session) return <Navigate replace to="/login" state={{ next: location.pathname }} />;

  return (
    <Routes>
      <Route element={<DashboardAccess key={session.user.id} client={client} session={session} />}>
        <Route index element={<Overview client={client} />} />
        <Route path="buyers" element={<BuyerCrm client={client} />} />
        <Route path="finder" element={<BuyerFinder client={client} />} />
        <Route path="*" element={<p>Workspace page not found. <Link to="/dashboard">Go to overview</Link></p>} />
      </Route>
    </Routes>
  );
}

export default function InternalRoutes() {
  return supabase ? <AuthenticatedRoutes client={supabase} /> : (
    <WorkspaceMessage>
      <BackToWebsite />
      <h1>Workspace unavailable</h1>
      <p className="workspace-muted">Set the Supabase project URL without an endpoint path and provide its publishable key.</p>
    </WorkspaceMessage>
  );
}
