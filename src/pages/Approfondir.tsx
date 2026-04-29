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
  Newspaper,
  BookOpen,
  Search,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

type Status = "Actu" | "Proposition" | "Mesure";

const STATUS_COLOR: Record<Status, string> = {
  Actu: "text-[#b90051]",
  Proposition: "text-purple-600",
  Mesure: "text-blue-600",
};

const DATA = {
  creator: {
    name: "@Marine",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
  },
  theme: "Mobilité",
  status: "Proposition" as Status,
  slides: [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800",
      text: "La fin des <span class='legit-gradient'>abonnements de transport gratuits</span> pour les jeunes ?",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
      text: "Une nouvelle <span class='legit-gradient'>mesure budgétaire</span> prévoit de remplacer la gratuité par un <span class='legit-gradient'>tarif réduit</span> indexé sur les revenus des parents.",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800",
      text: "Concrètement, les <span class='legit-gradient'>moins de 25 ans</span> paieraient entre 12 € et 24 € par mois selon leur situation, contre <span class='legit-gradient'>0 € aujourd'hui</span>.",
    },
    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1515165562835-c3b8c8ff0d23?w=800",
      text: "Les défenseurs de la mesure pointent une <span class='legit-gradient'>économie de 45M €/an</span> qui pourrait financer de nouvelles lignes de bus dans les zones rurales.",
    },
    {
      id: 5,
      image:
        "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800",
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

const Header = () => (
  <header className="flex items-center justify-between px-4 py-3">
    <div className="flex items-center gap-3">
      <img
        src={DATA.creator.avatar}
        alt={DATA.creator.name}
        className="w-9 h-9 rounded-full object-cover"
      />
      <span className="text-sm font-medium text-gray-900">
        {DATA.creator.name}
      </span>
    </div>
    <div className="flex items-center gap-2 text-sm font-semibold">
      <span className="text-gray-900">{DATA.theme}</span>
      <span className={STATUS_COLOR[DATA.status]}>{DATA.status}</span>
    </div>
  </header>
);

const Carousel = () => {
  const [active, setActive] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const goTo = (i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(DATA.slides.length - 1, i));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="px-4">
      <div className="relative w-full">
        <div
          ref={scrollerRef}
          className="w-full aspect-[4/5] overflow-x-auto snap-x snap-mandatory flex scrollbar-hide rounded-xl"
          onScroll={(e) => {
            const el = e.currentTarget;
            const i = Math.round(el.scrollLeft / el.clientWidth);
            if (i !== active) setActive(i);
          }}
        >
          {DATA.slides.map((s) => (
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

        {/* Tap zones (left/right) */}
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
          {active < DATA.slides.length - 1 && (
          <span className="w-6 h-6 rounded-full bg-black/20 group-hover:bg-black/40 transition flex items-center justify-center">
              <ChevronRight className="w-3.5 h-3.5 text-white" strokeWidth={1.75} />
            </span>
          )}
        </button>

        {/* Counter badge */}
        <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 text-xs rounded-full font-medium z-20">
          {active + 1}/{DATA.slides.length}
        </div>

        {/* Dots */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {DATA.slides.map((_, i) => (
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

const Simulator = () => {
  const sim = DATA.simulator;
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

      {/* Unified card */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-4">
        {/* Slider */}
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

        {/* Tabs */}
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

        {/* Result */}
        <div className="flex items-baseline gap-2">
          <span className={`text-4xl font-bold ${display.color}`}>
            {display.value}
          </span>
          <span className="text-sm text-gray-500">/ {display.metric}</span>
        </div>
        <p className="text-sm text-gray-700 mt-3 leading-snug">
          {display.desc}
        </p>

        <div className="flex items-end justify-between mt-5">
          {/* Reliability */}
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

          {/* Actions */}
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
                  active
                    ? `${VOTE_COLOR[key]} animate-vote-pop`
                    : "text-gray-700"
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

const BottomNav = () => {
  const navigate = useNavigate();
  const items = [
    { key: "actu", label: "Actu", Icon: Newspaper, to: "/" },
    {
      key: "approfondir",
      label: "Approfondir",
      Icon: BookOpen,
      to: "/approfondir",
      active: true,
    },
    { key: "recherche", label: "Recherche", Icon: Search, to: "/approfondir" },
    { key: "profil", label: "Profil", Icon: User, to: "/profil" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-16 bg-white border-t border-gray-200 z-50 flex justify-around items-center">
      {items.map(({ key, label, Icon, to, active }) => {
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

const Approfondir = () => {
  return (
    <main className="min-h-[100dvh] w-full bg-gray-50 flex justify-center">
      <div className="relative w-full max-w-[430px] min-h-[100dvh] bg-gray-50 pb-20">
        {/* Top back bar */}
        <div className="sticky top-0 z-20 flex items-center gap-2 px-3 py-3 bg-white/90 backdrop-blur-md border-b border-gray-200">
          <Link
            to="/"
            className="text-gray-900 p-1 -ml-1"
            aria-label="back"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={1.75} />
          </Link>
          <span className="text-sm font-semibold text-gray-900">
            Retour vers actu
          </span>
        </div>

        <Header />
        <Carousel />
        <Simulator />
        <Barometer />
      </div>
      <BottomNav />
    </main>
  );
};

export default Approfondir;
