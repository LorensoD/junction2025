"use client";

import { useState } from "react";
import Link from "next/link";

export default function PracticePage({ params }: { params: { scenario: string } }) {
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState("");

  const scenarioTitles: Record<string, string> = {
    "sell-pen": "Sell this pen",
    "salary": "Salary discussion",
    "pickup": "Pick up a girl at club",
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      // Simulate feedback after speaking
      setTimeout(() => {
        setFeedback("That was not so smart to say");
      }, 3000);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-purple-600">
      <main className="relative w-full max-w-md h-screen flex flex-col">
        {/* Header */}
        <div className="p-6 text-center">
          <h1 className="text-3xl font-bold text-white">Scenario:</h1>
          <h2 className="text-3xl font-bold text-white">
            {scenarioTitles[params.scenario] || "Unknown"}
          </h2>
        </div>

        {/* Avatar */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-64 h-64 bg-gradient-to-br from-purple-400 to-pink-300 rounded-full flex items-center justify-center">
            {/* Simple avatar face */}
            <div className="text-center">
              <div className="flex gap-8 mb-4">
                <div className="w-16 h-12 bg-gray-700 rounded-full"></div>
                <div className="w-16 h-12 bg-gray-700 rounded-full"></div>
              </div>
              <div className="w-8 h-8 bg-pink-400 rounded-full mx-auto mb-4"></div>
              <div className="w-24 h-2 bg-gray-700 rounded-full mx-auto"></div>
            </div>
          </div>
        </div>

        {/* Feedback bubble */}
        {feedback && (
          <div className="absolute bottom-32 left-4 right-4 bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-2xl">😐</span>
              <span className="text-base font-medium">{feedback}</span>
            </div>
          </div>
        )}

        {/* Bottom controls */}
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="px-6 py-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
            >
              Back
            </Link>
            <Link
              href={`/statistics/${params.scenario}`}
              className="px-6 py-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
            >
              View Stats
            </Link>
          </div>

          {/* Microphone button */}
          <button
            onClick={toggleListening}
            className={`w-20 h-20 mx-auto rounded-full transition-colors ${
              isListening ? "bg-red-500" : "bg-white"
            }`}
            aria-label={isListening ? "Stop recording" : "Start recording"}
          >
            <div className={`w-full h-full rounded-full ${isListening ? "animate-pulse" : ""}`}></div>
          </button>

          <div className="text-white text-center text-sm rotate-90 absolute right-0 top-1/2 origin-right">
            interest-o-meter
          </div>
        </div>
      </main>
    </div>
  );
}
