import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Bookmark,
  ThumbsDown,
  X,
  Minus,
  Check,
  ThumbsUp,
  BookOpen,
  Search,
  User,
  Newspaper,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  ApprofondirContent,
  DEFAULT_APPROFONDIR_DATA,
  type ApprofondirData,
} from "@/components/ApprofondirContent";

type Status = "Actu" | "Proposition" | "Mesure";

interface FeedItem {
  id: number;
  theme: string;
  status: Status;
  creator: string;
  avatar: string;
  hasEvent: boolean;
  title: string;
  subtitle: string;
  videoUrl: string;
  approfondir: ApprofondirData;
}

const FEED: FeedItem[] = [
  {
    id: 1,
    theme: "Emploi",
    status: "Actu",
    creator: "@Marine",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    hasEvent: true,
    title: "Le plafond des jobs étudiants",
    subtitle: "Faut-il modifier la limite des 600 heures ?",
    videoUrl:
      "https://www.youtube.com/embed/GV1TOAywqRU?autoplay=1&mute=1&playsinline=1&controls=0&rel=0&modestbranding=1&loop=1&playlist=GV1TOAywqRU",
    approfondir: { ...DEFAULT_APPROFONDIR_DATA, theme: "Emploi", status: "Actu" },
  },
  {
    id: 2,
    theme: "Logement",
    status: "Mesure",
    creator: "@Joachim",
    avatar:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150",
    hasEvent: false,
    title: "La baisse forcée des loyers",
    subtitle: "Vers un encadrement strict des kots",
    videoUrl:
      "https://www.youtube.com/embed/yNace7v-6HU?autoplay=1&mute=1&playsinline=1&controls=0&rel=0&modestbranding=1&loop=1&playlist=yNace7v-6HU",
    approfondir: {
      ...DEFAULT_APPROFONDIR_DATA,
      theme: "Logement",
      status: "Mesure",
      creator: {
        name: "@Joachim",
        avatar:
          "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100",
      },
    },
  },
];

const STATUS_COLOR: Record<Status, string> = {
  Actu: "text-[#b90051]",
  Proposition: "text-purple-500",
  Mesure: "text-blue-600",
};

type VoteKey = "down" | "against" | "neutral" | "for" | "up";

const VOTE_ACTIVE_COLOR: Record<VoteKey, string> = {
  down: "text-red-500",
  against: "text-orange-400",
  neutral: "text-gray-300",
  for: "text-emerald-400",
  up: "text-green-500",
};

const RightColumn = ({
  itemId,
  onExpand,
}: {
  itemId: number;
  onExpand: () => void;
}) => {
  const [saved, setSaved] = useState(false);
  const [vote, setVote] = useState<VoteKey | null>(null);
  const [popKey, setPopKey] = useState(0);

  const handleVote = (key: VoteKey) => {
    if (vote === key) {
      setVote(null);
      return;
    }
    setVote(key);
    setPopKey((k) => k + 1);
  };

  const voteBtn = (key: VoteKey, Icon: typeof ThumbsDown) => {
    const active = vote === key;
    return (
      <div key={`${itemId}-${key}`} className="relative">
        <button
          onClick={() => handleVote(key)}
          className={`block transition-colors duration-150 drop-shadow-md ${
            active ? `${VOTE_ACTIVE_COLOR[key]}` : "text-white"
          } ${active ? "animate-vote-pop" : ""}`}
          aria-label={key}
        >
          <Icon className="w-6 h-6" strokeWidth={1.75} />
        </button>
        {active && (
          <span
            key={popKey}
            className={`pointer-events-none absolute left-1/2 -translate-x-1/2 -top-1 animate-vote-particle ${VOTE_ACTIVE_COLOR[key]}`}
          >
            <Check className="w-3 h-3" strokeWidth={2.5} />
          </span>
        )}
      </div>
    );
  };

  const handlePillDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y < -50 || info.velocity.y < -20) {
      onExpand();
    }
  };

  return (
    <div className="absolute bottom-20 right-4 z-30 flex flex-col items-center gap-5">
      {voteBtn("down", ThumbsDown)}
      {voteBtn("against", X)}
      {voteBtn("neutral", Minus)}
      {voteBtn("for", Check)}
      {voteBtn("up", ThumbsUp)}

      <div className="w-6 h-px bg-white/30" />

      <button
        onClick={() => setSaved((s) => !s)}
        className={`transition-transform duration-150 drop-shadow-md ${
          saved ? "text-yellow-400 scale-110" : "text-white"
        }`}
        aria-label="save"
      >
        <Bookmark
          className="w-6 h-6"
          strokeWidth={1.75}
          fill={saved ? "currentColor" : "none"}
        />
      </button>

      {/* Approfondir trigger — transparent, drag-up to open */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.4}
        dragSnapToOrigin
        onDragEnd={handlePillDragEnd}
        onPointerDownCapture={(e) => e.stopPropagation()}
        onTouchStartCapture={(e) => e.stopPropagation()}
        style={{ touchAction: "none" }}
        className="cursor-grab active:cursor-grabbing"
      >
        <button
          onClick={onExpand}
          aria-label="Approfondir — glisser vers le haut"
          className="bg-transparent flex flex-col items-center gap-1 py-1"
        >
          <ChevronUp
            className="w-4 h-4 text-white animate-chevron-glide"
            strokeWidth={2}
          />
          <span
            className="text-[10px] font-semibold text-white tracking-[0.2em] uppercase"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            Approfondir
          </span>
        </button>
      </motion.div>
    </div>
  );
};

interface FeedBlockProps {
  item: FeedItem;
  isActive: boolean;
}

const FeedBlock = ({ item, isActive }: FeedBlockProps) => {
  const videoRef = useRef<HTMLIFrameElement>(null);
  const [expanded, setExpanded] = useState(false);

  // Pause video when expanded by removing autoplay flag
  useEffect(() => {
    if (!videoRef.current) return;
    const baseSrc = item.videoUrl;
    if (expanded) {
      videoRef.current.src = baseSrc.replace("autoplay=1", "autoplay=0");
    } else {
      videoRef.current.src = baseSrc;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  // Collapse if user scrolls to a different item
  useEffect(() => {
    if (!isActive && expanded) setExpanded(false);
  }, [isActive, expanded]);

  return (
    <div className="snap-start snap-always relative h-[100dvh] w-full">
      {/* Video layer (background) — animated for depth when expanded */}
      <motion.section
        className="absolute inset-0 overflow-hidden bg-black"
        animate={
          expanded
            ? { scale: 0.94, borderRadius: 20, opacity: 0.45 }
            : { scale: 1, borderRadius: 0, opacity: 1 }
        }
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
      >
        <iframe
          ref={videoRef}
          src={item.videoUrl}
          title={item.title}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />

        <header className="absolute top-8 w-full flex justify-center items-center gap-2 z-10">
          <span className="text-lg font-bold text-white drop-shadow-md">
            {item.theme}
          </span>
          <span
            className={`text-lg font-bold drop-shadow-md ${
              STATUS_COLOR[item.status]
            }`}
          >
            {item.status}
          </span>
        </header>

        <div className="absolute bottom-28 left-4 z-10 w-2/3">
          <div className="flex items-center gap-3">
            <div
              className={
                item.hasEvent
                  ? "p-[2px] rounded-full bg-gradient-to-tr from-[#b90051] via-fuchsia-500 to-amber-400"
                  : ""
              }
            >
              <img
                src={item.avatar}
                alt={item.creator}
                className="w-10 h-10 rounded-full object-cover border-2 border-black"
              />
            </div>
            <span className="text-sm font-medium text-white drop-shadow">
              {item.creator}
            </span>
          </div>

          <h2 className="text-base font-bold text-white mt-2 drop-shadow-md leading-tight">
            {item.title}
          </h2>
          <p className="text-sm font-light text-gray-200 mt-1 drop-shadow leading-snug">
            {item.subtitle}
          </p>
        </div>
      </motion.section>

      {/* Right-side column: votes + bookmark + Approfondir trigger */}
      {!expanded && (
        <RightColumn itemId={item.id} onExpand={() => setExpanded(true)} />
      )}

      {/* Bottom Sheet */}
      <AnimatePresence>
        {expanded && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/40 z-30"
              onClick={() => setExpanded(false)}
            />
            <motion.div
              key="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              onPointerDownCapture={(e) => e.stopPropagation()}
              onTouchStartCapture={(e) => e.stopPropagation()}
              className="absolute left-0 right-0 bottom-16 top-12 z-40 bg-slate-50 rounded-t-3xl shadow-2xl overflow-y-auto scrollbar-hide"
            >
              <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.3}
                dragSnapToOrigin
                onDragEnd={(_, info) => {
                  if (info.velocity.y > 200 || info.offset.y > 100) {
                    setExpanded(false);
                  }
                }}
                style={{ touchAction: "none" }}
                className="sticky top-0 z-10 bg-slate-50 pt-3 pb-2 flex justify-center cursor-grab active:cursor-grabbing"
              >
                <button
                  onClick={() => setExpanded(false)}
                  aria-label="Fermer"
                  className="w-10 h-1.5 rounded-full bg-gray-300"
                />
              </motion.div>
              <ApprofondirContent data={item.approfondir} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const NAV_ITEMS = [
  { key: "actu", label: "Actu", Icon: Newspaper, to: "/" },
  { key: "approfondir", label: "Approfondir", Icon: BookOpen, to: "/approfondir" },
  { key: "recherche", label: "Recherche", Icon: Search, to: "/" },
  { key: "profil", label: "Profil", Icon: User, to: "/profil" },
];

const BottomNav = ({ activeKey }: { activeKey: string }) => {
  const navigate = useNavigate();
  return (
    <nav className="absolute bottom-0 w-full h-16 bg-black/90 backdrop-blur-md z-50 flex justify-around items-center border-t border-white/10">
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
                style={{ stroke: "url(#legitGradient)" }}
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
          <linearGradient id="legitGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#b90051" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
      </svg>
    </nav>
  );
};

const Index = () => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);

  // Track which video is in view to pause others
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const i = Math.round(el.scrollTop / el.clientHeight);
      setActiveIndex(i);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Resolve current tab key from URL
  const currentTabIdx = (() => {
    const idx = NAV_ITEMS.findIndex((n) => n.to === location.pathname);
    return idx >= 0 ? idx : 0;
  })();

  // Global horizontal swipe → navigate between tabs
  const handleHorizontalSwipe = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    // Ignore if mostly vertical
    if (Math.abs(offset.x) < Math.abs(offset.y)) return;
    const SWIPE = 70;
    const VEL = 400;
    if (offset.x < -SWIPE || velocity.x < -VEL) {
      const next = Math.min(NAV_ITEMS.length - 1, currentTabIdx + 1);
      if (next !== currentTabIdx) navigate(NAV_ITEMS[next].to);
    } else if (offset.x > SWIPE || velocity.x > VEL) {
      const prev = Math.max(0, currentTabIdx - 1);
      if (prev !== currentTabIdx) navigate(NAV_ITEMS[prev].to);
    }
  };

  return (
    <main className="min-h-[100dvh] w-full bg-black flex justify-center">
      <div className="relative w-full max-w-[430px] h-[100dvh] bg-black overflow-hidden">
        {/* Global horizontal-swipe layer.
            Children call e.stopPropagation() on pointerdown to opt out
            (carousel, sheet, vertical-drag pill). */}
        <motion.div
          className="absolute inset-0"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0}
          dragSnapToOrigin
          onDragEnd={handleHorizontalSwipe}
          // Don't move the layer visually on horizontal drag
          dragMomentum={false}
        >
          <div
            ref={scrollerRef}
            className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
          >
            {FEED.map((item, idx) => (
              <FeedBlock
                key={item.id}
                item={item}
                isActive={idx === activeIndex}
              />
            ))}
          </div>
        </motion.div>
        <BottomNav activeKey="actu" />
      </div>
    </main>
  );
};

export default Index;
