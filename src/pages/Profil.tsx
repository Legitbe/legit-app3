import { useNavigate } from "react-router-dom";
import {
  Settings,
  Sparkles,
  Send,
  Newspaper,
  BookOpen,
  Search,
  User as UserIcon,
  Plane,
} from "lucide-react";

const DATA = {
  user: {
    name: "Sacha",
    handle: "@sacha_bxl",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
  },
  impact: {
    perso: [
      { value: "+46€", label: "Mobilité", type: "gain" as const },
      { value: "-2h", label: "Temps libre", type: "loss" as const },
    ],
    belgique: [
      { value: "+45M€", label: "Budget Climat", type: "gain" as const },
      { value: "-1.2k", label: "Emplois", type: "loss" as const },
    ],
  },
  recap: {
    title: "Ta semaine civique",
    stats: "4 lois analysées",
    topTheme: "Mobilité",
  },
  votes: [
    {
      theme: "Logement",
      choice: "👎",
      agrees: "12 453",
      status: "Envoyé au Ministre",
    },
    {
      theme: "Emploi",
      choice: "👍",
      agrees: "8 902",
      status: "Envoyé au Parlement",
    },
    {
      theme: "Climat",
      choice: "✔️",
      agrees: "5 211",
      status: "Envoyé à la Commission",
    },
  ],
  saved: [
    {
      id: 1,
      theme: "Emploi",
      title: "Plafond des 600h",
      img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400",
    },
    {
      id: 2,
      theme: "Mobilité",
      title: "Abonnement STIB",
      img: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400",
    },
    {
      id: 3,
      theme: "Logement",
      title: "Encadrement des kots",
      img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400",
    },
    {
      id: 4,
      theme: "Climat",
      title: "Taxe carbone jeunes",
      img: "https://images.unsplash.com/photo-1503437313881-503a91226402?w=400",
    },
  ],
};

const Header = () => (
  <header className="flex items-center justify-between pt-6 pb-4">
    <div className="flex items-center gap-3">
      <div className="p-[2px] rounded-full bg-gradient-to-tr from-[#b90051] to-blue-600">
        <img
          src={DATA.user.avatar}
          alt={DATA.user.name}
          className="w-12 h-12 rounded-full object-cover border-2 border-slate-50"
        />
      </div>
      <div>
        <h1 className="text-base font-bold text-slate-900 leading-tight">
          {DATA.user.name}
        </h1>
        <p className="text-xs text-slate-500">{DATA.user.handle}</p>
      </div>
    </div>
    <button
      aria-label="Paramètres"
      className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition"
    >
      <Settings className="w-5 h-5" strokeWidth={1.75} />
    </button>
  </header>
);

interface ImpactItem {
  value: string;
  label: string;
  type: "gain" | "loss";
}

const ImpactCard = ({
  title,
  items,
}: {
  title: string;
  items: ImpactItem[];
}) => (
  <div className="bg-white shadow-sm rounded-2xl p-4 border border-slate-200">
    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
      {title}
    </h3>
    <div className="space-y-2.5">
      {items.map((it) => (
        <div key={it.label} className="flex items-baseline justify-between">
          <span className="text-xs text-slate-600">{it.label}</span>
          <span
            className={`text-lg font-bold ${
              it.type === "gain" ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {it.value}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const ImpactSection = () => (
  <section className="mt-2">
    <h2 className="text-sm font-bold text-slate-900 mb-3">Mon Bilan</h2>
    <div className="grid grid-cols-2 gap-3">
      <ImpactCard title="Mon Quotidien" items={DATA.impact.perso} />
      <ImpactCard title="Ma Belgique" items={DATA.impact.belgique} />
    </div>
  </section>
);

const RecapCard = () => (
  <section className="mt-6">
    <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-[#b90051] via-fuchsia-600 to-blue-600 shadow-lg">
      {/* Decorative blobs */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-12 -left-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />

      <div className="relative">
        <div className="flex items-center gap-2 text-white/90">
          <Sparkles className="w-4 h-4" strokeWidth={2} />
          <span className="text-xs font-semibold uppercase tracking-wider">
            {DATA.recap.title}
          </span>
        </div>

        <p className="mt-3 text-white text-2xl font-bold leading-tight">
          Tu as pesé sur{" "}
          <span className="text-3xl">4 décisions</span> majeures cette semaine.
        </p>

        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-white/80">Ton thème fort</span>
          <span className="text-xs font-bold text-white bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
            ⚡ {DATA.recap.topTheme}
          </span>
        </div>

        <button className="mt-5 w-full flex items-center justify-center gap-2 bg-white text-slate-900 font-semibold text-sm py-2.5 rounded-full shadow-md active:scale-[0.98] transition">
          <Send className="w-4 h-4" strokeWidth={2} />
          Partager en Story
        </button>
      </div>
    </div>
  </section>
);

const VotesSection = () => (
  <section className="mt-7">
    <h2 className="text-sm font-bold text-slate-900 mb-2">Mes avis envoyés</h2>
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {DATA.votes.map((v, i) => (
        <div
          key={v.theme}
          className={`flex items-center gap-3 p-4 ${
            i !== DATA.votes.length - 1 ? "border-b border-slate-100" : ""
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl">
            {v.choice}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-slate-900">
                {v.theme}
              </span>
              <span className="text-[11px] text-slate-500">
                · {v.agrees} d'accord
              </span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Plane
                className="w-3 h-3 text-blue-600"
                strokeWidth={2}
              />
              <span className="text-[11px] text-slate-600">{v.status}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const SavedSection = () => (
  <section className="mt-7">
    <h2 className="text-sm font-bold text-slate-900 mb-3">
      Arguments sauvegardés
    </h2>
    <div className="grid grid-cols-2 gap-3">
      {DATA.saved.map((s) => (
        <div
          key={s.id}
          className="aspect-[4/5] rounded-xl overflow-hidden relative shadow-md"
        >
          <img
            src={s.img}
            alt={s.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <span className="text-[10px] font-semibold text-white/80 uppercase tracking-wide">
              {s.theme}
            </span>
            <h3 className="text-sm font-bold text-white leading-tight mt-0.5">
              {s.title}
            </h3>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const BottomNav = () => {
  const navigate = useNavigate();
  const items = [
    { key: "actu", label: "Actu", Icon: Newspaper, to: "/" },
    { key: "approfondir", label: "Approfondir", Icon: BookOpen, to: "/approfondir" },
    { key: "recherche", label: "Recherche", Icon: Search, to: "/" },
    { key: "profil", label: "Profil", Icon: UserIcon, to: "/profil", active: true },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-16 bg-white/95 backdrop-blur-md z-50 flex justify-around items-center border-t border-slate-200">
      {items.map(({ key, label, Icon, active, to }) => {
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
                style={{ stroke: "url(#legitGradientProfil)" }}
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
            className="flex flex-col items-center gap-0.5 text-slate-500"
          >
            <Icon className="w-5 h-5" strokeWidth={1.75} />
            <span className="text-[11px] font-medium">{label}</span>
          </button>
        );
      })}

      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="legitGradientProfil" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#b90051" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
      </svg>
    </nav>
  );
};

const Profil = () => {
  return (
    <main className="min-h-[100dvh] w-full bg-slate-100 flex justify-center">
      <div className="relative w-full max-w-[430px] min-h-[100dvh] bg-slate-50 px-4 pb-24">
        <Header />
        <ImpactSection />
        <RecapCard />
        <VotesSection />
        <SavedSection />
        <BottomNav />
      </div>
    </main>
  );
};

export default Profil;
