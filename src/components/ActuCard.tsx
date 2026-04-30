import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Minus,
  X,
  Check,
  Send,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { Measure, SimulatorConfig } from "@/lib/supabaseClient";

const STATUS_BADGE: Record<string, string> = {
  actu: "text-white",
  proposition: "text-white",
  mesure: "text-white",
};

const STATUS_BG: Record<string, string> = {
  actu: "#b90051",
  proposition: "#7a0090",
  mesure: "#3c00cf",
};

const STATUS_LABEL: Record<string, string> = {
  mesure: "Mesure",
  actu: "Actu",
  proposition: "Proposition",
};

const Header = ({ m }: { m: Measure }) => (
  <header className="flex items-center justify-between px-4 py-3">
    <div className="flex items-center gap-3">
      {m.creator_avatar_url ? (
        <img
          src={m.creator_avatar_url}
          alt={m.creator_handle}
          className="w-9 h-9 rounded-full object-cover"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-slate-200" />
      )}
      <span className="text-sm font-medium text-gray-900">{m.creator_handle}</span>
    </div>
    <div className="flex items-center gap-2">
      <span
        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[m.status] ?? "text-white"}`}
        style={{ backgroundColor: STATUS_BG[m.status] ?? "#64748b" }}
      >
        {STATUS_LABEL[m.status] ?? m.status}
      </span>
    </div>
  </header>
);

const Carousel = ({ slides }: { slides: Measure["slides"] }) => {
  const sorted = [...(slides ?? [])].sort((a, b) => a.order - b.order);
  const [active, setActive] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const goTo = (i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(sorted.length - 1, i));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
  };

  if (sorted.length === 0) return null;

  return (
    <div className="mx-0">
      <div className="relative w-full">
        <div
          ref={scrollerRef}
          className="w-full aspect-[4/5] overflow-x-auto snap-x snap-mandatory flex scrollbar-hide rounded-lg bg-slate-100"
          style={{ touchAction: "pan-x" }}
          onScroll={(e) => {
            const el = e.currentTarget;
            const i = Math.round(el.scrollLeft / el.clientWidth);
            if (i !== active) setActive(i);
          }}
        >
          {sorted.map((s, i) => (
            <div key={i} className="relative min-w-full h-full snap-start snap-always">
              <img src={s.url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        {sorted.length > 1 && (
          <>
            <button
              aria-label="Slide précédente"
              onClick={() => goTo(active - 1)}
              className="absolute left-0 top-0 h-full w-1/4 z-10 flex items-center justify-start pl-2 group"
            >
              {active > 0 && (
                <span className="w-6 h-6 rounded-full bg-black/20 group-hover:bg-black/40 transition flex items-center justify-center">
                  <ChevronLeft className="w-3.5 h-3.5 text-white" strokeWidth={1.75} />
                </span>
              )}
            </button>
            <button
              aria-label="Slide suivante"
              onClick={() => goTo(active + 1)}
              className="absolute right-0 top-0 h-full w-1/4 z-10 flex items-center justify-end pr-2 group"
            >
              {active < sorted.length - 1 && (
                <span className="w-6 h-6 rounded-full bg-black/20 group-hover:bg-black/40 transition flex items-center justify-center">
                  <ChevronRight className="w-3.5 h-3.5 text-white" strokeWidth={1.75} />
                </span>
              )}
            </button>

            <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 text-xs rounded-full font-medium z-20">
              {active + 1}/{sorted.length}
            </div>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
              {sorted.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === active ? "w-4 bg-white" : "w-1.5 bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

type VoteKey = "x" | "down" | "neutral" | "up" | "check";

const VOTE_ITEMS: { key: VoteKey; Icon: typeof X; activeColor: string; bg: string; value: number }[] = [
  { key: "x", Icon: X, activeColor: "text-red-600", bg: "bg-red-600", value: 1 },
  { key: "down", Icon: ChevronDown, activeColor: "text-orange-500", bg: "bg-orange-500", value: 2 },
  { key: "neutral", Icon: Minus, activeColor: "text-yellow-400", bg: "bg-yellow-400", value: 3 },
  { key: "up", Icon: ChevronUp, activeColor: "text-green-400", bg: "bg-green-400", value: 4 },
  { key: "check", Icon: Check, activeColor: "text-green-700", bg: "bg-green-700", value: 5 },
];
const VOTE_PCT = [12, 18, 20, 28, 22];

const getUserMessage = (voteValue: number, distribution: number[]) => {
  const disagreeTotal = distribution[0] + distribution[1];
  const agreeTotal = distribution[3] + distribution[4];
  if (voteValue === 3) return "Cette question divise vraiment pour l'instant";
  if (disagreeTotal >= 45 && agreeTotal >= 45) return "Cette mesure divise les avis";
  if (voteValue <= 2 && disagreeTotal >= 50) return "Beaucoup pensent comme toi sur cette question";
  if (voteValue >= 4 && agreeTotal >= 50) return "la plupart des gens qui ont voté partagent ton avis";
  if (voteValue <= 2) return "Tu fais partie d'une voix minoritaire ici";
  return "Ton avis est peu répandu, mais il compte autant.";
};

const BarometerActionRow = ({
  measure,
  showBarometer,
}: {
  measure: Measure;
  showBarometer: boolean;
}) => {
  const [vote, setVote] = useState<VoteKey | null>(null);
  const [saved, setSaved] = useState(false);
  const selected = VOTE_ITEMS.find((v) => v.key === vote);
  const storageKey = `saved_${measure.id}`;

  useEffect(() => {
    try {
      setSaved(localStorage.getItem(storageKey) === "1");
    } catch {
      /* noop */
    }
  }, [storageKey]);

  const handleShare = async () => {
    const shareData = {
      title: measure.title ?? "Legit",
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
    } catch {
      /* user cancelled or failed, fall through to clipboard */
    }
    try {
      await navigator.clipboard.writeText(shareData.url);
      toast("Lien copié");
    } catch {
      toast.error("Impossible de copier le lien");
    }
  };

  const toggleSaved = () => {
    setSaved((prev) => {
      const next = !prev;
      try {
        if (next) localStorage.setItem(storageKey, "1");
        else localStorage.removeItem(storageKey);
      } catch {
        /* noop */
      }
      return next;
    });
  };

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-5">
          {showBarometer &&
            VOTE_ITEMS.map(({ key, Icon, activeColor }) => {
              const isSelected = vote === key;
              const colorClass = isSelected ? activeColor : "text-slate-900";
              return (
                <button
                  key={key}
                  onClick={() => setVote(isSelected ? null : key)}
                  className={`transition-colors duration-150 ${colorClass}`}
                  aria-label={key}
                >
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </button>
              );
            })}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <button aria-label="Partager" onClick={handleShare} className="text-slate-900">
            <Send className="w-4 h-4" strokeWidth={1.75} />
          </button>
          <button
            aria-label={saved ? "Retirer des enregistrés" : "Enregistrer"}
            onClick={toggleSaved}
            className="text-slate-900"
          >
            {saved ? (
              <BookmarkCheck className="w-4 h-4" strokeWidth={1.75} fill="#3c00cf" stroke="#3c00cf" />
            ) : (
              <Bookmark className="w-4 h-4" strokeWidth={1.75} />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showBarometer && vote !== null && selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 pb-2"
          >
            <div className="flex w-full h-2 rounded-full overflow-hidden">
              {VOTE_ITEMS.map((it, i) => (
                <div key={it.key} className={`${it.bg} h-full`} style={{ width: `${VOTE_PCT[i]}%` }} />
              ))}
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-slate-400">
              {VOTE_PCT.map((p, i) => (
                <span key={i}>{p}%</span>
              ))}
            </div>
            <p className="text-sm text-slate-500 mt-2">
              {getUserMessage(selected.value, VOTE_PCT)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ConfidenceDots = ({ confidence }: { confidence: number }) => (
  <div className="flex items-center gap-1 mt-2">
    <span className="text-[11px] text-slate-500 mr-1">Fiabilité</span>
    {Array.from({ length: 5 }).map((_, i) => (
      <span
        key={i}
        className={`inline-block w-1.5 h-1.5 rounded-full ${
          i < confidence ? "bg-slate-700" : "bg-slate-200"
        }`}
      />
    ))}
  </div>
);

const renderRedistribution = (text: string) => {
  // Highlight fragment after "reversé" or "aux"
  const reMatch = text.match(/(.*?\breversé\s+)(.+)/i);
  if (reMatch) {
    return (
      <>
        {reMatch[1]}
        <span className="text-emerald-600 font-medium">{reMatch[2]}</span>
      </>
    );
  }
  const auxMatch = text.match(/(.*?\baux\s+)(.+)/i);
  if (auxMatch) {
    return (
      <>
        {auxMatch[1]}
        <span className="text-emerald-600 font-medium">{auxMatch[2]}</span>
      </>
    );
  }
  return text;
};

const Simulator = ({ config }: { config: SimulatorConfig }) => {
  const { input, formula, output, belgique, confidence, source } = config;
  const [value, setValue] = useState<number>(input.default);
  const [tab, setTab] = useState<"moi" | "be">("moi");

  const raw = value * formula.coefficient;
  const isNegative = formula.direction === "negative";
  const sign = isNegative ? "−" : "+";
  const colorClass = isNegative ? "text-rose-600" : "text-emerald-600";
  const label = isNegative ? output.label_negative ?? "impact" : output.label_positive ?? "impact";
  const formatted = `${sign}${Math.abs(raw).toLocaleString("fr-BE", { maximumFractionDigits: 1 })} ${output.unit}`;

  const pct = ((value - input.min) / (input.max - input.min)) * 100;

  return (
    <div className="bg-white border border-slate-100 rounded-lg mx-1 p-3 mt-3">
      <div className="grid grid-cols-2 bg-slate-100 rounded-full p-0.5 w-full">
        {(["moi", "be"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`text-xs px-3 py-1.5 rounded-full transition text-center ${
              tab === k ? "bg-white shadow-sm text-slate-900 font-semibold" : "text-slate-600"
            }`}
          >
            {k === "moi" ? "Pour moi" : "Pour la Belgique"}
          </button>
        ))}
      </div>

      <div className="mt-3 flex justify-between items-center">
        <span className="text-xs text-slate-600">{input.label}</span>
        <span className="text-xs font-semibold text-slate-900">
          {value.toLocaleString("fr-BE")} {input.unit}
        </span>
      </div>
      <input
        type="range"
        min={input.min}
        max={input.max}
        step={input.step}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="legit-range w-full mt-2"
        style={{ ["--range-progress" as string]: `${pct}%` }}
      />

      <div className="mt-4">
        {tab === "moi" ? (
          <div>
            <div className={`text-3xl font-bold ${colorClass}`}>{formatted}</div>
            <div className="text-sm text-slate-500 mt-0.5">{label}</div>
            <ConfidenceDots confidence={confidence} />
          </div>
        ) : (
          <div className="space-y-2 text-slate-700">
            <div
              className={`text-2xl font-bold ${
                /[−-]/.test(belgique.budget.trim().charAt(0)) ? "text-rose-600" : "text-emerald-600"
              }`}
            >
              {belgique.budget}
            </div>
            <div className="text-sm">{renderRedistribution(belgique.redistribution)}</div>
            {belgique.angles_morts?.length > 0 && (
              <div className="pt-1">
                <div className="text-xs text-slate-400 italic mb-1">
                  Ce qui n'est pas pris en compte
                </div>
                <ul className="list-none space-y-1">
                  {belgique.angles_morts.map((a, i) => (
                    <li key={i} className="italic text-slate-500 text-xs">— {a}</li>
                  ))}
                </ul>
              </div>
            )}
            <ConfidenceDots confidence={confidence} />
          </div>
        )}
      </div>

      <div className="mt-3 text-xs text-slate-400">{source}</div>
    </div>
  );
};

export const ActuCard = ({ measure }: { measure: Measure }) => (
  <div className="bg-white shadow-sm border border-slate-100 rounded-lg overflow-hidden">
    <Header m={measure} />
    <Carousel slides={measure.slides} />
    {measure.has_simulator && measure.simulator_config && (
      <Simulator config={measure.simulator_config} />
    )}
    <BarometerActionRow measure={measure} showBarometer={!!measure.has_barometer} />
    <div className="h-2" />
  </div>
);