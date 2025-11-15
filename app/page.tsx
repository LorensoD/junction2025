import Link from "next/link";

export default function Home() {
  const scenarios = [
    { id: "sell-pen", name: "Sell a pen to a stranger", difficulty: "Medium hard" },
    { id: "salary", name: "Salary discussion", difficulty: "Veteran" },
    { id: "pickup", name: "Pick up a girl at club", difficulty: "Mega Veteran" },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <main className="w-full max-w-md p-8 bg-white rounded-lg shadow-sm">
        <h1 className="text-4xl font-bold mb-2">Social trainer</h1>
        <h2 className="text-2xl font-semibold mb-8">Select scenario</h2>

        <div className="space-y-4">
          {scenarios.map((scenario) => (
            <Link
              key={scenario.id}
              href={`/practice/${scenario.id}`}
              className="block"
            >
              <button className="w-full p-6 bg-gray-200 hover:bg-gray-300 rounded-lg text-left transition-colors">
                <div className="text-xl font-semibold mb-1">{scenario.name}</div>
                <div className="text-base text-gray-700">{scenario.difficulty}</div>
              </button>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
