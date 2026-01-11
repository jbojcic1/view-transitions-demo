import { Link } from "react-router";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Gift Cards Demo" },
    { name: "description", content: "View Transition API Demo" },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Welcome</h1>
      <Link
        to="/gift-cards"
        className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
      >
        View Gift Cards
      </Link>
    </div>
  );
}
