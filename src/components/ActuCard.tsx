import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ThumbsDown, X, Minus, Check, ThumbsUp, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Measure } from "@/lib/supabaseClient";

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
    <div className="px-4">
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
  const items: { key: VoteKey; Icon: typeof ThumbsDown }[] = [
    { key: "down", Icon: ThumbsDown },
    { key: "against", Icon: X },
    { key: "neutral", Icon: Minus },
    { key: "for", Icon: Check },
    { key: "up", Icon: ThumbsUp },
  ];

  return (
    <div className="px-4 mt-4">
      <div className="flex justify-around items-center bg-white border border-slate-100 shadow-sm rounded-2xl py-4">
        {items.map(({ key, Icon }) => {
          const active = vote === key;
          return (
            <button
              key={key}
              onClick={() => setVote(active ? null : key)}
              className={`transition-colors duration-150 ${
                active ? `${VOTE_COLOR[key]} animate-vote-pop` : "text-gray-700"
              }`}
              aria-label={key}
            >
              <Icon className="w-5 h-5" strokeWidth={1.75} />
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {vote !== null && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-4 bg-white border border-slate-100 shadow-sm rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs font-medium text-gray-700">
                  {TOTAL_VOTERS.toLocaleString("fr-BE")} votants
                </span>
              </div>
              <div className="flex w-full h-3 rounded-full overflow-hidden">
                {VOTE_DISTRIBUTION.map((d) => (
                  <div key={d.key} className={`${d.bg} h-full`} style={{ width: `${d.pct}%` }} />
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

export const ActuCard = ({ measure }: { measure: Measure }) => (
  <div className="bg-white shadow-sm border border-slate-100 rounded-2xl overflow-hidden">
    <Header m={measure} />
    <Carousel slides={measure.slides} />
    {measure.has_barometer && <Barometer />}
    <div className="h-4" />
  </div>
);