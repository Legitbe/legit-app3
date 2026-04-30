import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Newspaper, User, Search, X } from "lucide-react";
import { ActuCard } from "@/components/ActuCard";
import { supabase, type Measure } from "@/lib/supabaseClient";

const NAV_ITEMS = [
  { key: "actu", label: "Actu", Icon: Newspaper, to: "/" },
  { key: "profil", label: "Profil", Icon: User, to: "/profil" },
];

const BottomNav = ({ activeKey }: { activeKey: string }) => {
  const navigate = useNavigate();
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-16 bg-white border-t border-gray-200 z-50 flex justify-around items-center">
      {NAV_ITEMS.map(({ key, label, Icon, to }) => {
        const active = key === activeKey;
        if (active) {
          return (
            <button
              key={key}
              onClick={() => navigate(to)}
              className="flex flex-col items-center gap-0.5"
            >
              <Icon
                className="w-5 h-5"
                strokeWidth={1.75}
                style={{ stroke: "url(#legitGradientLight)" }}
              />
              <span className="text-[11px] font-semibold bg-gradient-to-r from-[#b90051] to-blue-600 bg-clip-text text-transparent">
                {label}
              </span>
            </button>
          );
        }
        return (
          <button
            key={key}
            onClick={() => navigate(to)}
            className="flex flex-col items-center gap-0.5 text-gray-500"
          >
            <Icon className="w-5 h-5" strokeWidth={1.75} />
            <span className="text-[11px] font-medium">{label}</span>
          </button>
        );
      })}

      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="legitGradientLight" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#b90051" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
      </svg>
    </nav>
  );
};

const Index = () => {
  const [measures, setMeasures] = useState<Measure[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hideHeader, setHideHeader] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScrollY.current;
      if (y < 10) {
        setHideHeader(false);
      } else if (delta > 6) {
        setHideHeader(true);
      } else if (delta < -6) {
        setHideHeader(false);
      }
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("measures")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (error) {
        setError(error.message);
        setMeasures([]);
        return;
      }
      setMeasures((data ?? []) as Measure[]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = measures?.filter((m) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      (m.title ?? "").toLowerCase().includes(q) ||
      (m.theme ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <main className="min-h-[100dvh] w-full bg-slate-50 flex justify-center">
      <div
        className="relative w-full max-w-[430px] min-h-[100dvh] bg-slate-50 pb-24"
        style={{ scrollSnapType: "y proximity" }}
      >
        <header
          className={`sticky top-0 z-30 bg-slate-50/90 backdrop-blur-md border-b border-gray-200 px-4 py-3 transition-transform duration-300 ${
            hideHeader ? "-translate-y-full" : "translate-y-0"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-lg font-bold bg-gradient-to-r from-[#b90051] to-[#3c00cf] bg-clip-text text-transparent">
              Actu
            </h1>
            <button
              aria-label={searchOpen ? "Fermer la recherche" : "Rechercher"}
              onClick={() => {
                setSearchOpen((s) => !s);
                if (searchOpen) setQuery("");
              }}
              className="text-slate-700"
            >
              {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>
          </div>
          {searchOpen && (
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un thème ou un titre…"
              className="mt-2 w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#3c00cf]/30"
            />
          )}
        </header>

        <div className="px-3 pt-4">
          {measures === null && (
            <p className="text-center text-sm text-slate-500 py-12">Chargement…</p>
          )}
          {error && (
            <p className="text-center text-sm text-red-600 py-12">Erreur : {error}</p>
          )}
          {filtered && filtered.length === 0 && !error && measures && (
            <p className="text-center text-sm text-slate-500 py-12">
              {query ? "Aucun résultat." : "Aucune mesure publiée pour l'instant."}
            </p>
          )}
          {filtered?.map((m, idx) => (
            <article
              key={m.id}
              className={idx < filtered.length - 1 ? "mb-6" : ""}
              style={{ scrollSnapAlign: "start" }}
            >
              <ActuCard measure={m} />
            </article>
          ))}
        </div>
      </div>
      <BottomNav activeKey="actu" />
    </main>
  );
};

export default Index;