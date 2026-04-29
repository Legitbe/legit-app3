import { useMemo, useRef, useState } from "react";
import {
  Bookmark,
  Send,
  ThumbsDown,
  X,
  Minus,
  Check,
  ThumbsUp,
  ChevronLeft,
  ChevronRight,
  Users,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Status = "Actu" | "Proposition" | "Mesure";

const STATUS_COLOR: Record<Status, string> = {
  Actu: "text-[#b90051]",
  Proposition: "text-purple-600",
  Mesure: "text-blue-600",
};

export interface ApprofondirData {
  creator: { name: string; avatar: string };
  theme: string;
  status: Status;
  slides: { id: number; image: string; text: string }[];
  simulator: {
    variableName: string;
    defaultValue: number;
    unit: string;
    min: number;
    max: number;
    impactMoi: { base: number; metric: string; desc: string };
    impactBelgique: { base: number; metric: string; desc: string };
    redistribution?: string;
    anglesMorts?: string[];
  };
}

const Header = ({ data }: { data: ApprofondirData }) => (
  <header className="flex items-center justify-between px-4 py-3">
    <div className="flex items-center gap-3">
      <img
        src={data.creator.avatar}
        alt={data.creator.name}
        className="w-9 h-9 rounded-full object-cover"
      />
      <span className="text-sm font-medium text-gray-900">{data.creator.name}</span>
    </div>
    <div className="flex items-center gap-2 text-sm font-semibold">
      <span className="text-gray-900">{data.theme}</span>
      <span className={STATUS_COLOR[data.status]}>{data.status}</span>
    </div>
  </header>
);

const Carousel = ({ data }: { data: ApprofondirData }) => {
  const [active, setActive] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const goTo = (i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(data.slides.length - 1, i));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div
      className="px-4"
      onPointerDownCapture={(e) => e.stopPropagation()}
      onTouchStartCapture={(e) => e.stopPropagation()}
    >
      <div className="relative w-full">
        <div
          ref={scrollerRef}
          className="w-full aspect-[4/5] overflow-x-auto snap-x snap-mandatory flex scrollbar-hide rounded-xl"
          style={{ touchAction: "pan-x" }}
          onScroll={(e) => {
            const el = e.currentTarget;
            const i = Math.round(el.scrollLeft / el.clientWidth);
            if (i !== active) setActive(i);
          }}
        >
          {data.slides.map((s) => (
            <div
              key={s.id}
              className="relative min-w-full h-full snap-start snap-always"
            >
              <img
                src={s.image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute bottom-0 w-full h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6">
                <p
                  className="text-white text-2xl font-bold leading-snug drop-shadow-md"
                  dangerouslySetInnerHTML={{ __html: s.text }}
                />
              </div>
            </div>
          ))}
        </div>

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
          {active < data.slides.length - 1 && (
            <span className="w-6 h-6 rounded-full bg-black/20 group-hover:bg-black/40 transition flex items-center justify-center">
              <ChevronRight className="w-3.5 h-3.5 text-white" strokeWidth={1.75} />
            </span>
          )}
        </button>

        <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 text-xs rounded-full font-medium z-20">
          {active + 1}/{data.slides.length}
        </div>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {data.slides.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-4 bg-white" : "w-1.5 bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

type TabKey = "moi" | "be";

const Simulator = ({ data }: { data: ApprofondirData }) => {
  const sim = data.simulator;
  const [value, setValue] = useState(sim.defaultValue);
  const [tab, setTab] = useState<TabKey>("moi");

  const factor = value / sim.defaultValue;
  const moiVal = Math.round(sim.impactMoi.base * factor);
  const beVal = Math.round(sim.impactBelgique.base * factor);

  const display = useMemo(() => {
    if (tab === "moi") {
      return {
        value: `${moiVal} €`,
        metric: sim.impactMoi.metric,
        color: moiVal < 0 ? "text-red-500" : "text-green-600",
        desc: sim.impactMoi.desc,
      };
    }
    return {
      value: `${beVal > 0 ? "+" : ""}${beVal}M €`,
      metric: sim.impactBelgique.metric,
      color: beVal < 0 ? "text-red-500" : "text-green-600",
      desc: sim.impactBelgique.desc,
    };
  }, [tab, moiVal, beVal, sim]);

  const progressPct = ((value - sim.min) / (sim.max - sim.min)) * 100;

  return (
    <div className="px-4 mt-6">
      <h3 className="text-gray-900 text-base font-semibold mb-3">
        Simulateur d'impact
      </h3>

      <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-4">
        <div className="mb-5">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-sm text-gray-600">{sim.variableName}</span>
            <span className="text-sm font-semibold text-gray-900">
              {value} {sim.unit}
            </span>
          </div>
          <input
            type="range"
            min={sim.min}
            max={sim.max}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="legit-range w-full"
            style={
              {
                ["--range-progress" as string]: `${progressPct}%`,
              } as React.CSSProperties
            }
          />
        </div>

        <div className="flex bg-gray-100 rounded-full p-1 mb-4 w-full">
          {[
            { key: "moi" as const, label: "Pour moi" },
            { key: "be" as const, label: "Pour la Belgique" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-full transition-all ${
                tab === t.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-baseline gap-2">
          <span className={`text-4xl font-bold ${display.color}`}>
            {display.value}
          </span>
          <span className="text-sm text-gray-500">/ {display.metric}</span>
        </div>
        <p className="text-sm text-gray-700 mt-3 leading-snug">{display.desc}</p>

        {tab === "be" && (sim.redistribution || (sim.anglesMorts && sim.anglesMorts.length > 0)) && (
          <div className="mt-4 space-y-3">
            {sim.redistribution && (
              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm">
                {sim.redistribution}
              </div>
            )}
            {sim.anglesMorts && sim.anglesMorts.length > 0 && (
              <div className="mt-3 border-t border-dashed border-gray-200 pt-3 text-xs text-gray-500">
                <div className="flex items-center gap-1.5 mb-1.5 font-medium text-gray-600">
                  <AlertCircle className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>Angles morts</span>
                </div>
                <ul className="space-y-1 pl-5 list-disc">
                  {sim.anglesMorts.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex items-end justify-between mt-5">
          <div>
            <div className="flex gap-1 mb-1">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${
                    i < 3 ? "bg-gray-800" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-500">
              Fiabilité de l'estimation
            </span>
          </div>

          <div className="flex gap-3 text-gray-400">
            <button aria-label="share">
              <Send className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <button aria-label="save">
              <Bookmark className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

type VoteKey = "down" | "against" | "neutral" | "for" | "up";
const VOTE_COLOR: Record<VoteKey, string> = {
  down: "text-red-500",
  against: "text-orange-400",
  neutral: "text-gray-500",
  for: "text-emerald-500",
  up: "text-green-600",
};

const VOTE_DISTRIBUTION: { key: VoteKey; pct: number; bg: string }[] = [
  { key: "down", pct: 10, bg: "bg-red-500" },
  { key: "against", pct: 15, bg: "bg-orange-400" },
  { key: "neutral", pct: 20, bg: "bg-gray-400" },
  { key: "for", pct: 35, bg: "bg-emerald-400" },
  { key: "up", pct: 20, bg: "bg-green-600" },
];

const TOTAL_VOTERS = 12453;

const Barometer = () => {
  const [vote, setVote] = useState<VoteKey | null>(null);
  const [popKey, setPopKey] = useState(0);
  const items: { key: VoteKey; Icon: typeof ThumbsDown }[] = [
    { key: "down", Icon: ThumbsDown },
    { key: "against", Icon: X },
    { key: "neutral", Icon: Minus },
    { key: "for", Icon: Check },
    { key: "up", Icon: ThumbsUp },
  ];

  const hasVoted = vote !== null;

  const handleVote = (key: VoteKey) => {
    if (vote === key) {
      setVote(null);
      return;
    }
    setVote(key);
    setPopKey((k) => k + 1);
  };

  return (
    <div className="px-4 mt-4">
      <div className="flex justify-around items-center bg-white border border-gray-200 shadow-sm rounded-2xl py-4">
        {items.map(({ key, Icon }) => {
          const active = vote === key;
          return (
            <div key={key} className="relative">
              <button
                onClick={() => handleVote(key)}
                className={`block transition-colors duration-150 ${
                  active ? `${VOTE_COLOR[key]} animate-vote-pop` : "text-gray-700"
                }`}
                aria-label={key}
              >
                <Icon className="w-5 h-5" strokeWidth={1.75} />
              </button>
              {active && (
                <span
                  key={popKey}
                  className={`pointer-events-none absolute left-1/2 -translate-x-1/2 -top-1 animate-vote-particle ${VOTE_COLOR[key]}`}
                >
                  <Send className="w-3 h-3 -rotate-45" strokeWidth={2.2} />
                </span>
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {hasVoted && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-4 bg-white border border-gray-200 shadow-sm rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex -space-x-1.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center"
                    >
                      <Users className="w-2.5 h-2.5 text-gray-500" />
                    </div>
                  ))}
                </div>
                <span className="text-xs font-medium text-gray-700">
                  {TOTAL_VOTERS.toLocaleString("fr-BE")} votants
                </span>
              </div>

              <div className="flex w-full h-3 rounded-full overflow-hidden">
                {VOTE_DISTRIBUTION.map((d) => (
                  <div
                    key={d.key}
                    className={`${d.bg} h-full transition-all`}
                    style={{ width: `${d.pct}%` }}
                    title={`${d.pct}%`}
                  />
                ))}
              </div>

              <div className="flex justify-between mt-2 text-[10px] text-gray-500">
                {VOTE_DISTRIBUTION.map((d) => (
                  <span key={d.key}>{d.pct}%</span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ApprofondirContent = ({ data }: { data: ApprofondirData }) => {
  return (
    <div className="bg-slate-50 w-full pt-2 pb-8">
      <Header data={data} />
      <Carousel data={data} />
      <Simulator data={data} />
      <Barometer />
    </div>
  );
};

export const DEFAULT_APPROFONDIR_DATA: ApprofondirData = {
  creator: {
    name: "@Marine",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
  },
  theme: "Mobilité",
  status: "Proposition",
  slides: [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800",
      text: "La fin des <span class='legit-gradient'>abonnements de transport gratuits</span> pour les jeunes ?",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
      text: "Une nouvelle <span class='legit-gradient'>mesure budgétaire</span> prévoit de remplacer la gratuité par un <span class='legit-gradient'>tarif réduit</span> indexé sur les revenus des parents.",
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800",
      text: "Concrètement, les <span class='legit-gradient'>moins de 25 ans</span> paieraient entre 12 € et 24 € par mois selon leur situation, contre <span class='legit-gradient'>0 € aujourd'hui</span>.",
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1515165562835-c3b8c8ff0d23?w=800",
      text: "Les défenseurs de la mesure pointent une <span class='legit-gradient'>économie de 45M €/an</span> qui pourrait financer de nouvelles lignes de bus dans les zones rurales.",
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800",
      text: "Les opposants dénoncent une <span class='legit-gradient'>fracture sociale</span> : la mobilité gratuite est l'un des seuls leviers d'autonomie pour les étudiants précaires.",
    },
  ],
  simulator: {
    variableName: "Fréquence STIB/TEC/De Lijn",
    defaultValue: 15,
    unit: "j/mois",
    min: 0,
    max: 30,
    impactMoi: {
      base: -12,
      metric: "par mois",
      desc: "Surcoût mensuel estimé pour tes trajets. Soit ~144 €/an.",
    },
    impactBelgique: {
      base: 45,
      metric: "par an",
      desc: "Économie générée pour le budget des régions, réinvestie dans le réseau.",
    },
  },
};
