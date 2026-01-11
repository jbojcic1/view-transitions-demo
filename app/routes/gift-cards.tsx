import { useNavigate } from "react-router";
import type { Route } from "./+types/gift-cards";
import { useGiftCards } from "../context/gift-cards-context";

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

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Gift Cards" },
    { name: "description", content: "Manage your gift cards" },
  ];
}

type CardData = { id: string; name: string; color: string };

export default function GiftCards() {
  const navigate = useNavigate();
  const { addedCards, addCard } = useGiftCards();

  const handleCardClick = (card: CardData) => {
    navigate(`/gift-cards/${card.id}`, { viewTransition: true });
  };

  const handleBack = () => {
    navigate("/");
  };

  // Filter out cards that have already been added
  const remainingCards = AVAILABLE_CARDS.filter(
    (card) => !addedCards.some((added) => added.id === card.id)
  );

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
                  onClick={() => addCard(card)}
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
            <CardStack cards={addedCards} onCardClick={handleCardClick} />
          )}
        </section>
      </main>
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
  const PEEK_OFFSET = 40;

  return (
    <div className="relative" style={{ height: `${192 + (cards.length - 1) * PEEK_OFFSET}px` }}>
      {cards.map((card, index) => {
        const zIndex = index + 1;
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
