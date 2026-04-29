import { useNavigate } from "react-router-dom";
import { Newspaper, User } from "lucide-react";
import {
  ApprofondirContent,
  type ApprofondirData,
} from "@/components/ApprofondirContent";

const FEED: ApprofondirData[] = [
  {
    creator: {
      name: "@Joachim",
      avatar: "https://i.pravatar.cc/150?u=joachim",
    },
    theme: "Logement",
    status: "Mesure",
    slides: [
      {
        id: 1,
        image:
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800",
        text: "La baisse forcée des <span class='legit-gradient'>loyers étudiants</span> ?",
      },
      {
        id: 2,
        image:
          "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800",
        text: "Vers un <span class='legit-gradient'>encadrement strict</span> des kots en Belgique.",
      },
    ],
    simulator: {
      variableName: "Loyer actuel de ton kot",
      defaultValue: 450,
      unit: "€",
      min: 200,
      max: 1000,
      impactMoi: {
        base: -45,
        metric: "par mois",
        desc: "Économie mensuelle estimée.",
      },
      impactBelgique: {
        base: -15,
        metric: "par an",
        desc: "Baisse des recettes fiscales liées aux revenus locatifs.",
      },
      redistribution:
        "Baisse des recettes fiscales liées aux revenus locatifs.",
      anglesMorts: [
        "Risque de diminution de l'offre de kots",
        "Dégradation de l'entretien",
      ],
    },
  },
  {
    creator: {
      name: "@Marine",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    },
    theme: "Mobilité",
    status: "Proposition",
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
          "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800",
        text: "Concrètement, les <span class='legit-gradient'>moins de 25 ans</span> paieraient entre 12 € et 24 € par mois selon leur situation.",
      },
      {
        id: 3,
        image:
          "https://images.unsplash.com/photo-1515165562835-c3b8c8ff0d23?w=800",
        text: "Les défenseurs pointent une <span class='legit-gradient'>économie de 45M €/an</span> pour financer de nouvelles lignes de bus rurales.",
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
      redistribution:
        "Réinvestissement prévu dans le développement de lignes de bus dans les zones rurales.",
      anglesMorts: [
        "Fracture sociale pour les étudiants précaires",
        "Effet rebond sur l'usage de la voiture",
      ],
    },
  },
];

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
  return (
    <main className="min-h-[100dvh] w-full bg-slate-50 flex justify-center">
      <div className="relative w-full max-w-[430px] min-h-[100dvh] bg-slate-50 pb-24">
        <header className="sticky top-0 z-30 bg-slate-50/90 backdrop-blur-md border-b border-gray-200 px-4 py-3">
          <h1 className="text-lg font-bold bg-gradient-to-r from-[#b90051] to-blue-600 bg-clip-text text-transparent">
            Actu
          </h1>
        </header>

        <div>
          {FEED.map((item, idx) => (
            <article
              key={`${item.creator.name}-${idx}`}
              className={idx < FEED.length - 1 ? "mb-12" : ""}
            >
              <ApprofondirContent data={item} />
            </article>
          ))}
        </div>
      </div>
      <BottomNav activeKey="actu" />
    </main>
  );
};

export default Index;