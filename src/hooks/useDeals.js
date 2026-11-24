import { useEffect, useMemo, useRef, useState } from "react";
import { createLocalRepository, createSupabaseRepository } from "../lib/storage.js";
import { getSupabase } from "../lib/supabase.js";

/**
 * Estado dos negócios + operações assíncronas.
 * Com usuário autenticado no Supabase usa o banco; sem ele, o modo demonstração.
 * Os componentes não sabem onde os dados ficam.
 */
export function useDeals(userId, { enabled = true } = {}) {
  const [deals, setDeals] = useState([]);
  const [status, setStatus] = useState("local");
  // false enquanto os dados ainda podem chegar (mostra o skeleton).
  const [ready, setReady] = useState(false);
  const repoRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined; // aguardando a sessão: mantém o skeleton
    const supabase = userId ? getSupabase() : null;
    const callbacks = { onDeals: setDeals, onStatus: setStatus, onReady: () => setReady(true) };
    const repo = supabase
      ? createSupabaseRepository({ supabase, userId, ...callbacks })
      : createLocalRepository(callbacks);

    repoRef.current = repo;
    setReady(false);
    setDeals([]);
    repo.start();
    return () => repo.stop();
  }, [userId, enabled]);

  const actions = useMemo(
    () => ({
      save: (deal) => repoRef.current.save(deal),
      remove: (id) => repoRef.current.remove(id),
      saveMany: async (list) => {
        const repo = repoRef.current;
        if (repo.saveMany) return repo.saveMany(list);
        for (const deal of list) await repo.save(deal);
      },
    }),
    []
  );

  return { deals, status, ready, mode: userId ? "cloud" : "demo", ...actions };
}
