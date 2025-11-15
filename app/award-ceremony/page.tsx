"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { characters } from "../config/characters";

export default function AwardCeremony() {
  const [globalScore, setGlobalScore] = useState(0);
  const [won, setWon] = useState(false);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Calculate global score and generate feedback
    let totalScore = 0;
    const feedbackItems: string[] = [];

    characters.forEach((character) => {
      const objectivesKey = `objectives_${character.id}`;
      const storedObjectives = localStorage.getItem(objectivesKey);

      if (storedObjectives) {
        const objectives = JSON.parse(storedObjectives);
        const completedCount = objectives.filter((obj: any) => obj.completed).length;
        const completionRate = objectives.length > 0 ? completedCount / objectives.length : 0;
        const characterScore = character.scoreImpact * completionRate;
        totalScore += characterScore;

        // Generate feedback
        if (completionRate === 1) {
          feedbackItems.push(`✅ You successfully completed all objectives with ${character.name}`);
        } else if (completionRate > 0.5) {
          feedbackItems.push(`⚠️ You partially completed objectives with ${character.name}`);
        } else if (completionRate > 0) {
          feedbackItems.push(`❌ You struggled with ${character.name}'s objectives`);
        } else {
          feedbackItems.push(`❌ You didn't complete any objectives with ${character.name}`);
        }
      }
    });

    const finalScore = Math.round(totalScore);
    setGlobalScore(finalScore);
    setWon(finalScore >= 70);
    setFeedback(feedbackItems);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black">
        <div className="text-white text-2xl animate-pulse">Calculating results...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-black">
      {/* Animated green blobs for Junction branding */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-400/15 rounded-full blur-3xl" style={{ animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '700ms' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-green-300/10 rounded-full blur-3xl" style={{ animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
        <div className="absolute top-40 right-20 w-64 h-64 bg-green-500/25 rounded-full blur-3xl" style={{ animation: 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '1.2s' }}></div>
      </div>

      {/* Content */}
      <main className="relative min-h-screen flex flex-col items-center justify-center p-4 md:p-8 z-10">
        <div className="max-w-3xl w-full bg-white/5 backdrop-blur-xl rounded-3xl border-2 border-green-500/30 shadow-[0_0_40px_rgba(34,197,94,0.3)] p-8 md:p-12">
          {/* Result */}
          <div className="text-center mb-8">
            <div className="text-8xl mb-6 animate-bounce">
              {won ? "🏆" : "😔"}
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 drop-shadow-[0_0_30px_rgba(34,197,94,0.5)]">
              {won ? "You Won!" : "Better Luck Next Time"}
            </h1>
            <p className="text-2xl md:text-3xl text-white font-semibold mb-8">
              Final Score: <span className="font-black text-green-400">{globalScore}%</span>
            </p>
          </div>

          {/* Feedback */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border-2 border-green-500/20 p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Performance Summary
            </h2>
            <div className="space-y-3">
              {feedback.map((item, index) => (
                <div
                  key={index}
                  className="text-white text-lg bg-black/40 rounded-lg p-3 border border-green-500/20"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Result explanation */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border-2 border-green-500/20 p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-3">
              {won ? "Why You Won" : "Why You Didn't Win"}
            </h2>
            <p className="text-white text-base leading-relaxed">
              {won
                ? "You successfully navigated the social dynamics of the hackathon! Your ability to listen to Michael's ideas, motivate John to contribute, and impress Judge Nadia with your pitch secured your team's victory. Great communication skills!"
                : "While you made progress, you didn't quite achieve all the objectives needed to win. Remember: at hackathons, technical skills matter, but so do teamwork, communication, and presentation abilities. Keep practicing!"}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/"
              className="flex-1 bg-green-500 text-black font-bold py-4 px-8 rounded-xl hover:bg-green-400 transition-all shadow-[0_0_30px_rgba(34,197,94,0.5)] hover:shadow-[0_0_40px_rgba(34,197,94,0.7)] hover:scale-105 text-center text-lg"
            >
              Back to Home
            </Link>
            <button
              onClick={() => {
                // Clear all localStorage
                characters.forEach((character) => {
                  localStorage.removeItem(`objectives_${character.id}`);
                });
                window.location.href = "/";
              }}
              className="flex-1 bg-white/10 backdrop-blur-sm text-white font-bold py-4 px-8 rounded-xl hover:bg-white/20 transition-all border-2 border-green-500/30 hover:border-green-500/50 text-center text-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
