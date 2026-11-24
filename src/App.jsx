import { MotionConfig } from "motion/react";
import { useHashRoute } from "./hooks/useHashRoute.js";
import { ToastProvider } from "./components/ui/Toast.jsx";
import { SkipLink } from "./components/ui/SkipLink.jsx";
import { Landing } from "./features/landing/Landing.jsx";
import { CrmApp } from "./features/crm/CrmApp.jsx";

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
        {route === "app" ? <CrmApp onNavigate={navigate} /> : <Landing anchor={route} />}
      </ToastProvider>
    </MotionConfig>
  );
}
