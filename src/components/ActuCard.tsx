import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Minus, X, Check, Share2, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Measure, SimulatorConfig } from "@/lib/supabaseClient";

const STATUS_BADGE: Record<string, string> = {
  mesure: "bg-purple-100 text-purple-700",
  actu: "bg-pink-100 text-[#b90051]",
  proposition: "bg-orange-100 text-orange-700",
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
      <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white bg-gradient-to-r from-[#b90051] to-blue-600">
        {m.theme}
      </span>
      <span
        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
          STATUS_BADGE[m.status] ?? "bg-slate-100 text-slate-700"
        }`}
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
          className="w-full aspect-[4/5] overflow-x-auto snap-x snap-mandatory flex scrollbar-hide rounded-xl bg-slate-100"
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

const VOTE_ITEMS: { key: VoteKey; Icon: typeof X; activeColor: string; bg: string }[] = [
  { key: "x", Icon: X, activeColor: "text-red-600", bg: "bg-red-600" },
  { key: "down", Icon: ChevronDown, activeColor: "text-orange-400", bg: "bg-orange-400" },
  { key: "neutral", Icon: Minus, activeColor: "text-yellow-400", bg: "bg-yellow-400" },
  { key: "up", Icon: ChevronUp, activeColor: "text-green-400", bg: "bg-green-400" },
  { key: "check", Icon: Check, activeColor: "text-green-700", bg: "bg-green-700" },
];
const VOTE_PCT = [12, 18, 20, 28, 22];

const Barometer = () => {
  const [vote, setVote] = useState<VoteKey | null>(null);

  return (
    <div className="px-4 mt-3">
      <div className="flex items-center">
        <span className="text-xs text-slate-400 mr-3">Ton avis</span>
        <div className="flex items-center gap-5">
          {VOTE_ITEMS.map(({ key, Icon, activeColor }) => {
            const isSelected = vote === key;
            const hasSelection = vote !== null;
            const colorClass = isSelected
              ? activeColor
              : hasSelection
              ? "text-slate-200"
              : "text-slate-300";
            return (
              <button
                key={key}
                onClick={() => setVote(isSelected ? null : key)}
                className={`transition-colors duration-150 ${colorClass}`}
                aria-label={key}
              >
                <Icon size={18} strokeWidth={2} />
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {vote !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Simulator = ({ config }: { config: SimulatorConfig }) => {
  const { input, formula, output, belgique, confidence, source } = config;
  const [value, setValue] = useState<number>(input.default);
  const [tab, setTab] = useState<"moi" | "be">("moi");

  const raw = value * formula.coefficient;
  const isNegative = formula.direction === "negative";
  const sign = isNegative ? "−" : "+";
  const colorClass = isNegative ? "text-red-600" : "text-green-600";
  const label = isNegative ? output.label_negative ?? "impact" : output.label_positive ?? "impact";
  const formatted = `${sign}${Math.abs(raw).toLocaleString("fr-BE", { maximumFractionDigits: 1 })} ${output.unit}`;

  const pct = ((value - input.min) / (input.max - input.min)) * 100;

  return (
    <div className="bg-white border border-slate-100 rounded-xl mx-4 p-4 mt-3">
      <h3 className="text-sm font-semibold text-slate-900">Simulateur d'impact</h3>

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

      <div className="mt-4 flex gap-2">
        {(["moi", "be"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`text-xs px-3 py-1.5 rounded-full transition ${
              tab === k
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {k === "moi" ? "Pour moi" : "Pour la Belgique"}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "moi" ? (
          <div>
            <div className={`text-2xl font-bold ${colorClass}`}>{formatted}</div>
            <div className="text-xs text-slate-600 mt-0.5">{label}</div>
            <div className="flex items-center gap-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`inline-block w-1.5 h-1.5 rounded-full ${
                    i < confidence ? "bg-slate-700" : "bg-slate-200"
                  }`}
                />
              ))}
              <span className="text-[10px] text-slate-400 ml-1">{confidence}/5 confiance</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-xs text-slate-700">
            <div><span className="font-semibold">Budget : </span>{belgique.budget}</div>
            <div><span className="font-semibold">Redistribution : </span>{belgique.redistribution}</div>
            {belgique.angles_morts?.length > 0 && (
              <div className="pt-1">
                <div className="text-[11px] text-slate-500 mb-1">⚠️ Ce qu'on ne mesure pas :</div>
                <ul className="list-none space-y-1">
                  {belgique.angles_morts.map((a, i) => (
                    <li key={i} className="italic text-slate-500">— {a}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 text-xs text-slate-400">{source}</div>
    </div>
  );
};

const ActionRow = () => (
  <div className="px-4 mt-3 flex items-center">
    <button className="rounded-full border border-slate-200 text-slate-500 text-xs px-3 py-1.5 inline-flex items-center gap-1.5">
      <Share2 size={14} strokeWidth={1.75} />
      Partager
    </button>
    <div className="flex-1" />
    <button className="rounded-full border border-slate-200 text-slate-500 text-xs px-3 py-1.5 inline-flex items-center gap-1.5">
      <Bookmark size={14} strokeWidth={1.75} />
      Enregistrer
    </button>
  </div>
);

export const ActuCard = ({ measure }: { measure: Measure }) => (
  <div className="bg-white shadow-sm border border-slate-100 rounded-2xl overflow-hidden">
    <Header m={measure} />
    <Carousel slides={measure.slides} />
    {measure.has_simulator && measure.simulator_config && (
      <Simulator config={measure.simulator_config} />
    )}
    {measure.has_barometer && <Barometer />}
    <ActionRow />
    <div className="h-4" />
  </div>
);