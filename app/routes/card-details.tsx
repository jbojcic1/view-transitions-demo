import { useNavigate, useParams } from "react-router";
import type { Route } from "./+types/card-details";
import { useGiftCards } from "../context/gift-cards-context";

// Hardcoded transactions data
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

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `${params.cardId} - Gift Card Details` },
    { name: "description", content: "View gift card details" },
  ];
}

type CardData = { id: string; name: string; color: string };

export default function CardDetails() {
  const navigate = useNavigate();
  const { cardId } = useParams();
  const { addedCards } = useGiftCards();

  const card = addedCards.find((c) => c.id === cardId);
  const transactions = TRANSACTIONS[cardId || ""] || [];

  const handleBack = () => {
    navigate("/gift-cards", { viewTransition: true });
  };

  if (!card) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Card not found</p>
      </div>
    );
  }

  const PEEK_OFFSET = 40;
  const selectedIndex = addedCards.findIndex((c) => c.id === card.id);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-900">{card.name}</h1>
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
        {/* Card area at top - split-stack positioning */}
        <div className="relative p-4" style={{ minHeight: `${192 + 16}px` }}>
          {addedCards.map((c, index) => {
            const isSelected = c.id === card.id;
            const zIndex = index + 1;
            const isAtOrBelowSelected = index <= selectedIndex;

            if (isAtOrBelowSelected) {
              // Cards at or below selected: all at top position
              return (
                <div
                  key={c.id}
                  className={isSelected ? "relative" : "absolute left-4 right-4"}
                  style={{
                    top: isSelected ? undefined : "16px",
                    zIndex,
                    viewTransitionName: `card-${c.id}`,
                  }}
                >
                  <GiftCard card={c} size="large" />
                </div>
              );
            }

            // Cards above selected: off-screen at bottom
            const offsetBelowViewport = (index - selectedIndex - 1) * PEEK_OFFSET;
            return (
              <div
                key={c.id}
                className="absolute left-4 right-4"
                style={{
                  top: `calc(100vh + ${offsetBelowViewport}px)`,
                  zIndex,
                  viewTransitionName: `card-${c.id}`,
                }}
              >
                <GiftCard card={c} size="large" />
              </div>
            );
          })}
        </div>

        {/* Transactions */}
        <div className="flex-1 p-4 view-transition-transactions overflow-auto">
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
      </main>
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
