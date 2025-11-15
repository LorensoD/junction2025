import Link from "next/link";

export default function StatisticsPage({ params }: { params: { scenario: string } }) {
  const scenarioTitles: Record<string, string> = {
    "sell-pen": "Sell this pen",
    "salary": "Salary discussion",
    "pickup": "Pick up a girl at club",
  };

  const feedback = [
    {
      type: "negative",
      title: "You said something stupid",
      description: "Don't mention your gambling addiction.",
    },
    {
      type: "positive",
      title: "That was smart to say",
      description: "You highlighted the importance of having a pen. That's pretty smart when selling a pen",
    },
    {
      type: "improvement",
      title: "You can improve this next time",
      description: "Next time don't insult her",
    },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-purple-700">
      <main className="w-full max-w-md p-8 m-4 bg-white rounded-3xl shadow-lg">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Scenario:</h1>
          <h2 className="text-2xl font-bold mb-4">
            {scenarioTitles[params.scenario] || "Unknown"}
          </h2>
        </div>

        <h3 className="text-3xl font-bold mb-6">Live statistics</h3>

        {/* Feedback items */}
        <div className="space-y-6">
          {feedback.map((item, index) => (
            <div key={index} className="space-y-2">
              <h4 className="text-xl font-bold">{item.title}</h4>
              <p className="text-base text-gray-700 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Back button */}
        <div className="mt-8">
          <Link
            href={`/practice/${params.scenario}`}
            className="block w-full py-4 bg-purple-600 hover:bg-purple-700 text-white text-center rounded-full font-semibold transition-colors"
          >
            Back to Practice
          </Link>
        </div>
      </main>
    </div>
  );
}
