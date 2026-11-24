import { useCallback, useEffect, useState } from "react";
import { safeStorage } from "../lib/format.js";
import { getSupabase, isSupabaseConfigured } from "../lib/supabase.js";

/**
 * Autenticação.
 * - Com Supabase configurado: contas reais (Supabase Auth), com confirmação de
 *   e-mail e recuperação de senha. A sessão é renovada automaticamente.
 * - Sem Supabase: contas de DEMONSTRAÇÃO salvas só no navegador
 *   (hash SHA-256 com salt; não substitui autenticação real).
 * As duas formas expõem a mesma interface para a interface.
 */

/* ---------- Mensagens de erro do Supabase em português ---------- */
export function describeAuthError(error) {
  const message = error?.message || "";
  if (/invalid login credentials/i.test(message)) return "E-mail ou senha incorretos.";
  if (/already registered|already been registered|user already exists/i.test(message)) return "Já existe uma conta com este e-mail. Entre com ela.";
  if (/email not confirmed/i.test(message)) return "Confirme seu e-mail pelo link que enviamos antes de entrar.";
  if (/password should be|weak password/i.test(message)) return "Senha fraca. Use pelo menos 8 caracteres, com letras e números.";
  if (/rate limit|too many requests|security purposes/i.test(message)) return "Muitas tentativas seguidas. Aguarde um minuto e tente de novo.";
  if (/fetch|network/i.test(message)) return "Sem conexão com o servidor. Verifique sua internet.";
  return "Não foi possível concluir. Tente novamente.";
}

const fromSupabaseUser = (user) =>
  user ? { id: user.id, email: user.email, name: user.user_metadata?.name || user.email.split("@")[0] } : null;

const redirectUrl = () => (typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}#app` : undefined);

/* ---------- Modo demonstração (sem servidor) ---------- */
const USERS_KEY = "fluxo-users";
const SESSION_KEY = "fluxo-session";
const toHex = (buffer) => [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");

async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  return toHex(await crypto.subtle.digest("SHA-256", data));
}
const publicDemoUser = (user) => (user ? { name: user.name, email: user.email } : null);
function currentDemoUser() {
  const email = safeStorage.get(SESSION_KEY, null);
  return publicDemoUser(safeStorage.get(USERS_KEY, []).find((u) => u.email === email));
}

/* ---------- Hook ---------- */
export function useAuth() {
  const supabase = getSupabase();
  const [user, setUser] = useState(() => (supabase ? null : currentDemoUser()));
  const [loading, setLoading] = useState(Boolean(supabase));
  const [recovering, setRecovering] = useState(false); // usuário abriu o link de "redefinir senha"

  useEffect(() => {
    if (!supabase) return undefined;
    supabase.auth.getSession().then(({ data }) => {
      setUser(fromSupabaseUser(data.session?.user));
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(fromSupabaseUser(session?.user));
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
    });
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  const register = useCallback(
    async ({ name, email, password }) => {
      const normalized = email.trim().toLowerCase();
      if (supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: normalized,
          password,
          options: { data: { name: name.trim() }, emailRedirectTo: redirectUrl() },
        });
        if (error) throw new Error(describeAuthError(error));
        // Com confirmação de e-mail ativa, o Supabase não devolve sessão até o clique no link.
        // Se o e-mail já existe, devolve um usuário sem identidades (proteção contra enumeração).
        if (data.user && data.user.identities?.length === 0) throw new Error(describeAuthError({ message: "already registered" }));
        return { user: fromSupabaseUser(data.user), needsConfirmation: !data.session };
      }
      const users = safeStorage.get(USERS_KEY, []);
      if (users.some((u) => u.email === normalized)) throw new Error("Já existe uma conta com este e-mail. Entre com ela.");
      const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
      const account = { name: name.trim(), email: normalized, salt, hash: await hashPassword(password, salt) };
      safeStorage.set(USERS_KEY, [...users, account]);
      safeStorage.set(SESSION_KEY, normalized);
      setUser(publicDemoUser(account));
      return { user: publicDemoUser(account), needsConfirmation: false };
    },
    [supabase]
  );

  const login = useCallback(
    async ({ email, password }) => {
      const normalized = email.trim().toLowerCase();
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email: normalized, password });
        if (error) throw new Error(describeAuthError(error));
        return { user: fromSupabaseUser(data.user) };
      }
      const account = safeStorage.get(USERS_KEY, []).find((u) => u.email === normalized);
      if (!account || (await hashPassword(password, account.salt)) !== account.hash) throw new Error("E-mail ou senha incorretos.");
      safeStorage.set(SESSION_KEY, normalized);
      setUser(publicDemoUser(account));
      return { user: publicDemoUser(account) };
    },
    [supabase]
  );

  const logout = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    else safeStorage.set(SESSION_KEY, null);
    setUser(null);
  }, [supabase]);

  const resetPassword = useCallback(
    async (email) => {
      if (!supabase) throw new Error("A recuperação de senha precisa do servidor (Supabase) configurado.");
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: redirectUrl() });
      if (error) throw new Error(describeAuthError(error));
    },
    [supabase]
  );

  const updatePassword = useCallback(
    async (password) => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(describeAuthError(error));
      setRecovering(false);
    },
    [supabase]
  );

  return {
    user,
    loading,
    recovering,
    mode: isSupabaseConfigured ? "cloud" : "demo",
    register,
    login,
    logout,
    resetPassword,
    updatePassword,
    cancelRecovery: () => setRecovering(false),
  };
}
