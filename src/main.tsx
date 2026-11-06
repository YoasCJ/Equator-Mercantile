
import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Link, Route, Routes } from "react-router";
import App from "./app/App";
import "./styles/index.css";

const InternalRoutes = lazy(() => import("./app/internal/InternalRoutes"));

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Suspense fallback={<p className="p-6" role="status">Loading Equator workspace…</p>}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<InternalRoutes />} />
        <Route path="/dashboard/*" element={<InternalRoutes />} />
        <Route path="*" element={
          <main className="p-6">
            <h1>Page not found</h1>
            <Link className="underline" to="/">Back to website</Link>
          </main>
        } />
      </Routes>
    </Suspense>
  </BrowserRouter>,
);
