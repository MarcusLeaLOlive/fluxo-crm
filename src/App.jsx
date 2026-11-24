import { lazy, Suspense } from "react";
import { MotionConfig } from "motion/react";
import { useHashRoute } from "./hooks/useHashRoute.js";
import { ToastProvider } from "./components/ui/Toast.jsx";
import { SkipLink } from "./components/ui/SkipLink.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import { Landing } from "./features/landing/Landing.jsx";
// O CRM (com Supabase, gráficos e formulários) só é baixado ao abrir a demonstração.
const CrmApp = lazy(() => import("./features/crm/CrmApp.jsx").then((m) => ({ default: m.CrmApp })));

function CrmLoading() {
  return (
    <div className="app-loading" role="status">
      <span className="spinner" aria-hidden="true" />
      Carregando o CRM
    </div>
  );
}

/**
 * Rotas: "#app" abre o CRM; qualquer outro hash mostra a apresentação
 * e rola até a seção com aquele id (#recursos, #tecnologia, #sobre).
 */
export default function App() {
  const [route, navigate] = useHashRoute();
  return (
    // reducedMotion="user": o Motion respeita a preferência de menos movimento do sistema.
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <SkipLink />
        <ErrorBoundary key={route}>
          {route === "app" ? (
            <Suspense fallback={<CrmLoading />}>
              <CrmApp onNavigate={navigate} />
            </Suspense>
          ) : (
            <Landing anchor={route} />
          )}
        </ErrorBoundary>
      </ToastProvider>
    </MotionConfig>
  );
}
