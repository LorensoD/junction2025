import Link from "next/link";
import Image from "next/image";
import { characters } from "./config/characters";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Fullscreen Map Background */}
      <div className="absolute inset-0">
        <Image
          src="/map.jpg.webp"
          alt="Hackathon venue map"
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay for better text/UI contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70" />
      </div>

      {/* Content */}
      <main className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="text-center pt-6 pb-8 px-4">
          <h1 className="text-4xl md:text-7xl font-bold mb-3 text-white tracking-tight" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.9)' }}>
            Hackathon Simulator
          </h1>
          <p className="text-base md:text-2xl text-white/95 font-medium max-w-2xl mx-auto" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
            Navigate social interactions at Junction to win the hackathon
          </p>
        </div>

        {/* Character Avatars Floating on Map */}
        <div className="flex-1 relative flex items-center justify-center">
          <div className="relative w-full max-w-4xl aspect-video">
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
                    <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-white shadow-2xl hover:scale-110 transition-all cursor-pointer overflow-hidden"
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
