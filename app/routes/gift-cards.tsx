import { useState, useCallback } from "react";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router";
import type { Route } from "./+types/gift-cards";

// Hardcoded data
const AVAILABLE_CARDS = [
  { id: "amazon", name: "Amazon", color: "#FF9900" },
  { id: "starbucks", name: "Starbucks", color: "#00704A" },
  { id: "target", name: "Target", color: "#CC0000" },
  { id: "apple", name: "Apple", color: "#555555" },
  { id: "spotify", name: "Spotify", color: "#1DB954" },
  { id: "netflix", name: "Netflix", color: "#E50914" },
  { id: "uber", name: "Uber", color: "#000000" },
  { id: "airbnb", name: "Airbnb", color: "#FF5A5F" },
];

const TRANSACTIONS: Record<string, { id: string; description: string; amount: string; date: string }[]> = {
  amazon: [
    { id: "1", description: "Electronics Purchase", amount: "-$49.99", date: "Jan 10" },
    { id: "2", description: "Book Order", amount: "-$24.99", date: "Jan 8" },
    { id: "3", description: "Refund", amount: "+$15.00", date: "Jan 5" },
  ],
  starbucks: [
    { id: "1", description: "Grande Latte", amount: "-$5.75", date: "Jan 11" },
    { id: "2", description: "Breakfast Sandwich", amount: "-$4.95", date: "Jan 9" },
  ],
  target: [
    { id: "1", description: "Household Items", amount: "-$67.32", date: "Jan 7" },
    { id: "2", description: "Groceries", amount: "-$45.21", date: "Jan 3" },
  ],
  apple: [
    { id: "1", description: "App Store", amount: "-$9.99", date: "Jan 10" },
    { id: "2", description: "iCloud Storage", amount: "-$2.99", date: "Jan 1" },
  ],
  spotify: [
    { id: "1", description: "Premium Subscription", amount: "-$10.99", date: "Jan 1" },
  ],
  netflix: [
    { id: "1", description: "Monthly Subscription", amount: "-$15.49", date: "Jan 1" },
  ],
  uber: [
    { id: "1", description: "Ride to Airport", amount: "-$42.50", date: "Jan 9" },
    { id: "2", description: "Uber Eats Order", amount: "-$28.99", date: "Jan 6" },
  ],
  airbnb: [
    { id: "1", description: "Weekend Stay", amount: "-$245.00", date: "Jan 5" },
  ],
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Gift Cards" },
    { name: "description", content: "Manage your gift cards" },
  ];
}

type CardData = { id: string; name: string; color: string };
type ViewState = "browse" | "detail";

// Dynamically inject CSS for view-transition-group z-indexes based on stack order
function injectViewTransitionZIndexes(cards: CardData[]): () => void {
  const styleId = "view-transition-z-indexes";

  // Remove existing style if any
  const existing = document.getElementById(styleId);
  if (existing) existing.remove();

  // Create new style with z-indexes based on current stack order
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = cards
    .map((card, index) => {
      const zIndex = index + 1;
      return `::view-transition-group(card-${card.id}) { z-index: ${zIndex}; }`;
    })
    .join("\n");

  document.head.appendChild(style);

  // Return cleanup function
  return () => {
    const el = document.getElementById(styleId);
    if (el) el.remove();
  };
}

export default function GiftCards() {
  const navigate = useNavigate();
  const [addedCards, setAddedCards] = useState<CardData[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [viewState, setViewState] = useState<ViewState>("browse");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const addCard = useCallback((card: CardData) => {
    setAddedCards((prev) => {
      // Don't add duplicates
      if (prev.some((c) => c.id === card.id)) return prev;
      return [...prev, card];
    });
  }, []);

  const handleCardClick = useCallback((card: CardData) => {
    if (isTransitioning) return;

    // Use View Transition API with flushSync for synchronous DOM updates
    if (document.startViewTransition) {
      setIsTransitioning(true);

      // Inject CSS to set correct z-indexes for view-transition-groups
      const cleanup = injectViewTransitionZIndexes(addedCards);

      const transition = document.startViewTransition(() => {
        flushSync(() => {
          setSelectedCard(card);
          setViewState("detail");
        });
      });
      transition.finished.then(() => {
        setIsTransitioning(false);
        cleanup();
      });
    } else {
      setSelectedCard(card);
      setViewState("detail");
    }
  }, [isTransitioning, addedCards]);

  const handleBack = useCallback(() => {
    if (isTransitioning) return;

    if (viewState === "detail") {
      // Go back to browse view
      if (document.startViewTransition) {
        setIsTransitioning(true);

        // Inject CSS to set correct z-indexes for view-transition-groups
        const cleanup = injectViewTransitionZIndexes(addedCards);

        const transition = document.startViewTransition(() => {
          flushSync(() => {
            setViewState("browse");
          });
        });
        transition.finished.then(() => {
          setIsTransitioning(false);
          setSelectedCard(null);
          cleanup();
        });
      } else {
        setSelectedCard(null);
        setViewState("browse");
      }
    } else {
      // Go back to home
      navigate("/");
    }
  }, [viewState, navigate, isTransitioning, addedCards]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-900">Gift Cards</h1>
        <button
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {viewState === "browse" ? (
          <BrowseView
            availableCards={AVAILABLE_CARDS}
            addedCards={addedCards}
            onAddCard={addCard}
            onCardClick={handleCardClick}
          />
        ) : (
          <DetailView
            card={selectedCard!}
            allCards={addedCards}
            transactions={TRANSACTIONS[selectedCard?.id || ""] || []}
          />
        )}
      </main>
    </div>
  );
}

// Browse View: Available cards + Stacked added cards
function BrowseView({
  availableCards,
  addedCards,
  onAddCard,
  onCardClick,
}: {
  availableCards: CardData[];
  addedCards: CardData[];
  onAddCard: (card: CardData) => void;
  onCardClick: (card: CardData) => void;
}) {
  // Filter out cards that have already been added
  const remainingCards = availableCards.filter(
    (card) => !addedCards.some((added) => added.id === card.id)
  );

  return (
    <>
      {/* Available cards - horizontal scroll */}
      <section className="p-4 view-transition-available">
        <h2 className="text-sm font-medium text-gray-500 mb-3">Add a Card</h2>
        {remainingCards.length === 0 ? (
          <p className="text-gray-400 text-sm">All cards added!</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {remainingCards.map((card) => (
              <button
                key={card.id}
                onClick={() => onAddCard(card)}
                className="flex-shrink-0"
              >
                <GiftCard card={card} size="small" />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Stacked added cards - aligned to bottom */}
      <section className="flex-1 flex flex-col justify-end p-4 pb-8">
        {addedCards.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No cards added yet. Tap a card above to add it.</p>
        ) : (
          <CardStack cards={addedCards} onCardClick={onCardClick} />
        )}
      </section>
    </>
  );
}

// Detail View: Selected card + Transactions
// All cards rendered in ONE container in stack DOM order for correct view-transition z-index
function DetailView({
  card,
  allCards,
  transactions,
}: {
  card: CardData;
  allCards: CardData[];
  transactions: { id: string; description: string; amount: string; date: string }[];
}) {
  const PEEK_OFFSET = 20;

  return (
    <div className="flex-1 flex flex-col">
      {/* Transactions - shown below the card area */}
      <div className="flex-1 p-4 view-transition-transactions order-2">
        <h2 className="text-sm font-medium text-gray-500 mb-3">Transactions</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No transactions yet.</p>
        ) : (
          <ul className="space-y-2">
            {transactions.map((tx) => (
              <li
                key={tx.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
              >
                <div>
                  <p className="font-medium text-gray-900">{tx.description}</p>
                  <p className="text-sm text-gray-500">{tx.date}</p>
                </div>
                <span
                  className={`font-semibold ${
                    tx.amount.startsWith("+") ? "text-green-600" : "text-gray-900"
                  }`}
                >
                  {tx.amount}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ALL cards in ONE container, in stack DOM order */}
      {/* Selected card positioned at top, others invisible at stack positions */}
      <div
        className="relative p-4 order-1"
        style={{ minHeight: `${192 + 16}px` }}
      >
        {allCards.map((c, index) => {
          const isSelected = c.id === card.id;
          const zIndex = index + 1;
          const bottomOffset = (allCards.length - 1 - index) * PEEK_OFFSET;

          if (isSelected) {
            // Selected card: positioned at top (not in stack position)
            return (
              <div
                key={c.id}
                className="w-full"
                style={{
                  viewTransitionName: `card-${c.id}`,
                }}
              >
                <GiftCard card={c} size="large" />
              </div>
            );
          }

          // Non-selected cards: invisible at their stack positions
          return (
            <div
              key={c.id}
              className="absolute left-4 right-4 mx-auto opacity-0 pointer-events-none"
              style={{
                bottom: `${bottomOffset + 16}px`, // +16 for padding
                zIndex,
                viewTransitionName: `card-${c.id}`,
              }}
            >
              <GiftCard card={c} size="large" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Card Stack Component
function CardStack({
  cards,
  onCardClick,
}: {
  cards: CardData[];
  onCardClick: (card: CardData) => void;
}) {
  // cards array: oldest first, newest last
  // We want: newest at bottom (fully visible), older cards peek from above
  const PEEK_OFFSET = 20;

  return (
    <div className="relative" style={{ height: `${192 + (cards.length - 1) * PEEK_OFFSET}px` }}>
      {cards.map((card, index) => {
        // Newest card (last in array) should have highest z-index
        const zIndex = index + 1;
        // Newest card at bottom: 0, older cards positioned higher (peek from top)
        const bottomOffset = (cards.length - 1 - index) * PEEK_OFFSET;

        return (
          <button
            key={card.id}
            onClick={() => onCardClick(card)}
            className="absolute left-0 right-0 mx-auto transition-transform hover:scale-[1.02]"
            style={{
              bottom: `${bottomOffset}px`,
              zIndex,
              viewTransitionName: `card-${card.id}`,
            }}
          >
            <GiftCard card={card} size="large" />
          </button>
        );
      })}
    </div>
  );
}

// Gift Card Component
function GiftCard({ card, size }: { card: CardData; size: "small" | "large" }) {
  const isSmall = size === "small";

  return (
    <div
      className={`rounded-xl flex items-center justify-center shadow-lg ${
        isSmall ? "w-32 h-20" : "w-full max-w-sm h-48"
      }`}
      style={{ backgroundColor: card.color }}
    >
      <span
        className={`font-bold text-white ${isSmall ? "text-sm" : "text-2xl"}`}
      >
        {card.name}
      </span>
    </div>
  );
}
