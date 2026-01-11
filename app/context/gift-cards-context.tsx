import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type CardData = { id: string; name: string; color: string };

type GiftCardsContextType = {
  addedCards: CardData[];
  addCard: (card: CardData) => void;
};

const GiftCardsContext = createContext<GiftCardsContextType | null>(null);

export function GiftCardsProvider({ children }: { children: ReactNode }) {
  const [addedCards, setAddedCards] = useState<CardData[]>([]);

  const addCard = useCallback((card: CardData) => {
    setAddedCards((prev) => {
      if (prev.some((c) => c.id === card.id)) return prev;
      return [...prev, card];
    });
  }, []);

  return (
    <GiftCardsContext.Provider value={{ addedCards, addCard }}>
      {children}
    </GiftCardsContext.Provider>
  );
}

export function useGiftCards() {
  const context = useContext(GiftCardsContext);
  if (!context) {
    throw new Error("useGiftCards must be used within GiftCardsProvider");
  }
  return context;
}
