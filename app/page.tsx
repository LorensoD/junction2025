"use client";

import Link from "next/link";
import Image from "next/image";
import { characters } from "./config/characters";
import { useEffect, useState } from "react";

export default function Home() {
  const [globalScore, setGlobalScore] = useState(0);
  const [hasSpokenToAll, setHasSpokenToAll] = useState(false);

  useEffect(() => {
    // Calculate global score from localStorage
    let totalScore = 0;
    const spokenTo = new Set<string>();

    characters.forEach((character) => {
      const objectivesKey = `objectives_${character.id}`;
      const storedObjectives = localStorage.getItem(objectivesKey);

      if (storedObjectives) {
        spokenTo.add(character.id);
        const objectives = JSON.parse(storedObjectives);
        const completedCount = objectives.filter((obj: any) => obj.completed).length;
        const completionRate = objectives.length > 0 ? completedCount / objectives.length : 0;
        totalScore += character.scoreImpact * completionRate;
      }
    });

    setGlobalScore(Math.round(totalScore));
    setHasSpokenToAll(spokenTo.size === characters.length);
  }, []);

  // Color based on score
  const getScoreColor = (score: number) => {
    if (score < 33) return { from: '#ef4444', to: '#dc2626' }; // red
    if (score < 66) return { from: '#f59e0b', to: '#d97706' }; // orange/yellow
    return { from: '#10b981', to: '#059669' }; // green
  };

  const scoreColor = getScoreColor(globalScore);

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0" style={{ background: 'var(--gradient-bg)' }}>
        {/* Animated blobs for depth */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl" style={{ animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '700ms' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" style={{ animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
      </div>

      {/* Content */}
      <main className="relative min-h-screen flex flex-col p-4 md:p-8 z-10">
        {/* Header with glassmorphism badge */}
        <div className="text-center pt-8 pb-8 md:pb-12 px-4">
          <div className="inline-block mb-6 px-6 py-3 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 shadow-2xl hover:bg-white/15 transition-all">
            <p className="text-sm md:text-base text-white/95 font-semibold tracking-wider uppercase">
              Welcome to
            </p>
          </div>
          <h1 className="text-6xl md:text-8xl mb-6 text-white tracking-tight font-black relative">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-pink-100" style={{ textShadow: '0 0 40px rgba(255,255,255,0.5)' }}>
              Junction
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-100 via-purple-100 to-white" style={{ textShadow: '0 0 40px rgba(255,255,255,0.5)' }}>
              Simulator
            </span>
          </h1>
          <p className="text-lg md:text-2xl text-white/95 font-medium max-w-3xl mx-auto leading-relaxed px-4" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
            Master social interactions and <span className="font-bold text-pink-200">win the hackathon</span>
          </p>

          {/* Thermometer Bar - Likelihood of Winning */}
          <div className="mt-10 max-w-2xl mx-auto px-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-6">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                Chance of Winning
              </h2>

              {/* Thermometer */}
              <div className="relative w-full h-8 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/30">
                {/* Fill */}
                <div
                  className="h-full transition-all duration-700 ease-out relative"
                  style={{
                    width: `${globalScore}%`,
                    background: `linear-gradient(90deg, ${scoreColor.from}, ${scoreColor.to})`
                  }}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                </div>

                {/* Score text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-lg drop-shadow-lg" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>
                    {globalScore}%
                  </span>
                </div>
              </div>

              {/* Award Ceremony Button */}
              {hasSpokenToAll && (
                <Link
                  href="/award-ceremony"
                  className="mt-6 block w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 font-bold py-4 px-8 rounded-xl hover:from-yellow-300 hover:to-yellow-500 transition-all shadow-2xl hover:scale-105 text-center text-lg"
                >
                  🏆 Go to Award Ceremony
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Character Avatars Floating on Map */}
        <div className="flex-1 relative flex items-center justify-center px-4">
          {/* Glow effect behind the map */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full max-w-4xl aspect-video bg-gradient-to-br from-purple-500/30 via-pink-500/30 to-blue-500/30 blur-3xl rounded-full"></div>
          </div>

          {/* Map Card with Enhanced Glassmorphism */}
          <div
              className="relative w-full max-w-4xl aspect-video bg-white/10 backdrop-blur-xl rounded-3xl border-2 border-white/30 shadow-2xl hover:border-white/50 hover:bg-white/15 transition-all p-8"
              style={{
                  backgroundImage: 'url(map3.jpg.webp)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
          }}
          >
            {characters.map((character) => (
              <Link
                key={character.id}
                href={`/practice/${character.id}`}
                className="absolute group"
                style={{
                  left: `${character.position.x}%`,
                  top: `${character.position.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {/* Character Avatar with Name & Title */}
                <div className="flex flex-col items-center">
                  {/* Avatar Circle */}
                  <div className="relative mb-2">
                    {/* Ping animation */}
                    <span className="absolute inset-0 rounded-full bg-pink-400 animate-ping opacity-60"></span>

                    {/* Character Pin with Face Photo */}
                    <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-white shadow-2xl hover:scale-110 hover:shadow-pink-500/50 transition-all cursor-pointer overflow-hidden"
                         style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                      <Image
                        src={character.faceImage}
                        alt={character.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Name & Title */}
                  <div className="text-center">
                    <div className="font-bold text-white text-base md:text-xl mb-0.5" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}>
                      {character.name}
                    </div>
                    <div className="text-xs md:text-sm text-white/90 font-medium px-3 py-1 bg-black/40 backdrop-blur-sm rounded-full" style={{ textShadow: '0 1px 5px rgba(0,0,0,0.8)' }}>
                      {character.title}
                    </div>
                  </div>

                  {/* Goal Tooltip on Hover */}
                  <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-3 min-w-[200px] opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10 border border-white/50">
                    <div className="text-xs text-gray-700 text-center">
                      🎯 {character.goal}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
