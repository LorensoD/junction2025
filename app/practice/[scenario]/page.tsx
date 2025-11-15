"use client";

import { useState } from "react";
import Link from "next/link";

type Emotion = "neutral" | "talking" | "happy" | "mad" | "sad";

export default function PracticePage({ params }: { params: { scenario: string } }) {
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [emotion, setEmotion] = useState<Emotion>("neutral");

  const scenarioTitles: Record<string, string> = {
    "sell-pen": "Sell this pen",
    "salary": "Salary discussion",
    "pickup": "Pick up a girl at club",
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setEmotion("talking");
      // Simulate feedback after speaking
      setTimeout(() => {
        setFeedback("That was not so smart to say");
        setEmotion("neutral");
      }, 3000);
    } else {
      setEmotion("neutral");
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
              {/* Eyes with brow movement */}
              <div className="flex gap-8 mb-4">
                <div className="relative">
                  <div className={`w-16 h-12 bg-gray-700 rounded-full transition-all duration-300 ${
                    emotion !== "sad" ? "animate-[blink_4s_ease-in-out_infinite]" : ""
                  } ${emotion === "mad" ? "scale-90" : ""}`}></div>
                  <div className={`absolute -top-2 left-0 w-16 h-1 bg-gray-800 rounded-full transition-all duration-300 ${
                    emotion === "neutral" || emotion === "talking" ? "animate-[eyebrow_3s_ease-in-out_infinite]" : ""
                  } ${emotion === "mad" ? "-rotate-12 translate-y-1" : ""} ${
                    emotion === "sad" ? "rotate-12 translate-y-1" : ""
                  } ${emotion === "happy" ? "rotate-6 -translate-y-1" : ""}`}></div>
                </div>
                <div className="relative">
                  <div className={`w-16 h-12 bg-gray-700 rounded-full transition-all duration-300 ${
                    emotion !== "sad" ? "animate-[blink_4s_ease-in-out_infinite_0.1s]" : ""
                  } ${emotion === "mad" ? "scale-90" : ""}`}></div>
                  <div className={`absolute -top-2 left-0 w-16 h-1 bg-gray-800 rounded-full transition-all duration-300 ${
                    emotion === "neutral" || emotion === "talking" ? "animate-[eyebrow_3s_ease-in-out_infinite_0.1s]" : ""
                  } ${emotion === "mad" ? "rotate-12 translate-y-1" : ""} ${
                    emotion === "sad" ? "-rotate-12 translate-y-1" : ""
                  } ${emotion === "happy" ? "-rotate-6 -translate-y-1" : ""}`}></div>
                </div>
              </div>
              {/* Nose */}
              <div className="w-8 h-8 bg-pink-400 rounded-full mx-auto mb-4"></div>
              {/* Mouth with emotion-based shapes */}
              <div className="relative h-8 flex items-center justify-center">
                {emotion === "neutral" && (
                  <div className="w-24 h-2 bg-gray-700 rounded-full"></div>
                )}
                {emotion === "talking" && (
                  <div className="w-24 h-6 bg-gray-700 rounded-full animate-[talk_0.5s_ease-in-out_infinite]"></div>
                )}
                {emotion === "happy" && (
                  <div className="w-24 h-12 border-4 border-gray-700 border-t-transparent rounded-b-full"></div>
                )}
                {emotion === "mad" && (
                  <div className="w-24 h-3 bg-gray-700 rounded-sm"></div>
                )}
                {emotion === "sad" && (
                  <div className="w-24 h-12 border-4 border-gray-700 border-b-transparent rounded-t-full"></div>
                )}
              </div>
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
          {/* Emotion buttons */}
          <div className="flex gap-2 justify-center flex-wrap">
            <button
              onClick={() => setEmotion("neutral")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                emotion === "neutral" ? "bg-white text-purple-600" : "bg-white/20 text-white"
              }`}
            >
              Neutral
            </button>
            <button
              onClick={() => setEmotion("talking")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                emotion === "talking" ? "bg-white text-purple-600" : "bg-white/20 text-white"
              }`}
            >
              Talking
            </button>
            <button
              onClick={() => setEmotion("happy")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                emotion === "happy" ? "bg-white text-purple-600" : "bg-white/20 text-white"
              }`}
            >
              Happy
            </button>
            <button
              onClick={() => setEmotion("mad")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                emotion === "mad" ? "bg-white text-purple-600" : "bg-white/20 text-white"
              }`}
            >
              Mad
            </button>
            <button
              onClick={() => setEmotion("sad")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                emotion === "sad" ? "bg-white text-purple-600" : "bg-white/20 text-white"
              }`}
            >
              Sad
            </button>
          </div>

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
