import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type EnergyType = "Abraço" | "Força" | "Esperança" | "Paz" | "Você não está sozinho";

export type Letter = {
  id: string;
  avatar: string;
  author: string;
  category: string;
  title: string;
  body: string;
  createdLabel: string;
  energies: number;
  comments: Array<{ id: string; author: string; text: string; helped: boolean }>;
  own?: boolean;
};

export type RefugioProfile = {
  pseudonym: string;
  avatar: string;
  interests: string[];
  pactAccepted: boolean;
};

export type GardenSnapshot = {
  profile: RefugioProfile | null;
  journal: string[];
  energyCount: number;
  adviceCount: number;
  helpedCount: number;
};

type Stats = Pick<GardenSnapshot, "energyCount" | "adviceCount" | "helpedCount">;

type StoreValue = {
  isReady: boolean;
  profile: RefugioProfile | null;
  letters: Letter[];
  energyCount: number;
  adviceCount: number;
  helpedCount: number;
  journal: string[];
  setProfile: (profile: RefugioProfile) => void;
  publishLetter: (input: Pick<Letter, "category" | "title" | "body">) => void;
  sendEnergy: (letterId: string, energy: EnergyType) => void;
  addAdvice: (letterId: string, text: string) => void;
  markHelped: (letterId: string, commentId: string) => void;
  addJournal: (note: string) => void;
  getGardenSnapshot: () => GardenSnapshot;
  restoreGardenSnapshot: (snapshot: GardenSnapshot) => void;
  clearLocalData: () => Promise<void>;
};

const profileKey = "refugio.profile.v1";
const lettersKey = "refugio.letters.v1";
const journalKey = "refugio.journal.v1";
const statsKey = "refugio.stats.v1";

const initialLetters: Letter[] = [
  {
    id: "carta-1",
    avatar: "🫖",
    author: "Chá de fim de tarde",
    category: "Burnout",
    title: "Estou tentando reaprender a descansar",
    body: "Passei tanto tempo achando que precisava dar conta de tudo que descansar parece culpa. Hoje consegui fechar o computador antes do anoitecer. É pequeno, mas quis dividir com alguém.",
    createdLabel: "há pouco",
    energies: 0,
    comments: [
      { id: "conselho-1", author: "Livro aberto", text: "Pequenos limites também são uma forma de cuidado. Seu descanso não precisa ser merecido.", helped: false },
    ],
  },
  {
    id: "carta-2",
    avatar: "🦋",
    author: "Borboleta em pausa",
    category: "Fim de ciclo",
    title: "Como se sabe que é hora de ir?",
    body: "Estou me despedindo de uma amizade importante. Ainda tenho carinho, mas percebi que me encolho para caber nela. Estou com medo e, ao mesmo tempo, sentindo alívio.",
    createdLabel: "hoje",
    energies: 0,
    comments: [],
  },
  {
    id: "carta-3",
    avatar: "🪴",
    author: "Plantinha na janela",
    category: "Vitórias pequenas",
    title: "Marquei minha primeira consulta",
    body: "Adiei por meses, mas hoje pedi ajuda profissional. Estou nervosa, só que orgulhosa por ter dado esse primeiro passo.",
    createdLabel: "hoje",
    energies: 0,
    comments: [],
  },
];

function parseStoredValue<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function mergeLetters(saved: unknown): Letter[] {
  const stored = Array.isArray(saved) ? (saved as Letter[]).filter((letter) => letter && typeof letter.id === "string") : [];
  const storedIds = new Set(stored.map((letter) => letter.id));
  return [...stored, ...initialLetters.filter((letter) => !storedIds.has(letter.id))];
}

const RefugioContext = createContext<StoreValue | null>(null);

export function RefugioProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [profile, setProfileState] = useState<RefugioProfile | null>(null);
  const [letters, setLetters] = useState<Letter[]>(initialLetters);
  const [journal, setJournal] = useState<string[]>([]);
  const [stats, setStats] = useState<Stats>({ energyCount: 0, adviceCount: 0, helpedCount: 0 });

  useEffect(() => {
    let active = true;

    async function hydrate() {
      try {
        const [savedProfile, savedLetters, savedJournal, savedStats] = await Promise.all([
          AsyncStorage.getItem(profileKey),
          AsyncStorage.getItem(lettersKey),
          AsyncStorage.getItem(journalKey),
          AsyncStorage.getItem(statsKey),
        ]);
        if (!active) return;

        setProfileState(parseStoredValue<RefugioProfile | null>(savedProfile, null));
        setLetters(mergeLetters(parseStoredValue<unknown>(savedLetters, [])));
        setJournal(parseStoredValue<string[]>(savedJournal, []));
        setStats({
          energyCount: parseStoredValue<Partial<Stats>>(savedStats, {}).energyCount ?? 0,
          adviceCount: parseStoredValue<Partial<Stats>>(savedStats, {}).adviceCount ?? 0,
          helpedCount: parseStoredValue<Partial<Stats>>(savedStats, {}).helpedCount ?? 0,
        });
      } finally {
        if (active) setIsReady(true);
      }
    }

    void hydrate();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;
    void Promise.all([
      profile ? AsyncStorage.setItem(profileKey, JSON.stringify(profile)) : AsyncStorage.removeItem(profileKey),
      AsyncStorage.setItem(lettersKey, JSON.stringify(letters.filter((letter) => letter.own))),
      AsyncStorage.setItem(journalKey, JSON.stringify(journal)),
      AsyncStorage.setItem(statsKey, JSON.stringify(stats)),
    ]);
  }, [isReady, profile, letters, journal, stats]);

  const setProfile = (nextProfile: RefugioProfile) => {
    setProfileState(nextProfile);
  };

  const publishLetter = (input: Pick<Letter, "category" | "title" | "body">) => {
    const nextLetter: Letter = {
      ...input,
      id: `minha-carta-${Date.now()}`,
      avatar: profile?.avatar ?? "🌻",
      author: profile?.pseudonym ?? "Girassol sereno",
      createdLabel: "agora",
      energies: 0,
      comments: [],
      own: true,
    };
    setLetters((current) => [nextLetter, ...current]);
  };

  const sendEnergy = (letterId: string, _energy: EnergyType) => {
    setLetters((current) => current.map((letter) => (letter.id === letterId ? { ...letter, energies: letter.energies + 1 } : letter)));
    setStats((current) => ({ ...current, energyCount: current.energyCount + 1 }));
  };

  const addAdvice = (letterId: string, text: string) => {
    const clean = text.trim();
    if (!clean) return;
    const newAdvice = { id: `conselho-${Date.now()}`, author: profile?.pseudonym ?? "Coração atento", text: clean, helped: false };
    setLetters((current) => current.map((letter) => (letter.id === letterId ? { ...letter, comments: [...letter.comments, newAdvice] } : letter)));
    setStats((current) => ({ ...current, adviceCount: current.adviceCount + 1 }));
  };

  const markHelped = (letterId: string, commentId: string) => {
    const targetLetter = letters.find((letter) => letter.id === letterId);
    const targetComment = targetLetter?.comments.find((comment) => comment.id === commentId);
    if (!targetComment || targetComment.helped) return;

    setLetters((current) => current.map((letter) => (letter.id === letterId ? { ...letter, comments: letter.comments.map((comment) => comment.id === commentId ? { ...comment, helped: true } : comment) } : letter)));
    setStats((current) => ({ ...current, helpedCount: current.helpedCount + 1 }));
  };

  const addJournal = (note: string) => {
    const clean = note.trim();
    if (!clean) return;
    setJournal((current) => [clean, ...current]);
  };

  const getGardenSnapshot = (): GardenSnapshot => ({ profile, journal, ...stats });

  const restoreGardenSnapshot = (snapshot: GardenSnapshot) => {
    setProfileState(snapshot.profile);
    setJournal(snapshot.journal);
    setStats({ energyCount: snapshot.energyCount, adviceCount: snapshot.adviceCount, helpedCount: snapshot.helpedCount });
  };

  const clearLocalData = async () => {
    await Promise.all([profileKey, lettersKey, journalKey, statsKey].map((key) => AsyncStorage.removeItem(key)));
    setProfileState(null);
    setLetters(initialLetters);
    setJournal([]);
    setStats({ energyCount: 0, adviceCount: 0, helpedCount: 0 });
  };

  const value = useMemo(
    () => ({ isReady, profile, letters, energyCount: stats.energyCount, adviceCount: stats.adviceCount, helpedCount: stats.helpedCount, journal, setProfile, publishLetter, sendEnergy, addAdvice, markHelped, addJournal, getGardenSnapshot, restoreGardenSnapshot, clearLocalData }),
    [isReady, profile, letters, stats, journal],
  );

  return <RefugioContext.Provider value={value}>{children}</RefugioContext.Provider>;
}

export function useRefugio() {
  const context = useContext(RefugioContext);
  if (!context) throw new Error("useRefugio deve ser usado dentro de RefugioProvider");
  return context;
}
