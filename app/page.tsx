import Link from "next/link";
import Image from "next/image";
import { characters } from "./config/characters";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4" style={{ background: 'var(--gradient-bg)' }}>
      <main className="w-full max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-3 text-white tracking-tight drop-shadow-lg">
            Social Trainer
          </h1>
          <p className="text-xl text-white/90 font-medium">Navigate the Junction social challenges</p>
        </div>

        {/* Hackathon Map */}
        <div className="relative w-full aspect-video rounded-3xl shadow-2xl overflow-hidden border-4 border-white/30 backdrop-blur-sm"
             style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)' }}>
            <Image
                src="/map.jpg.webp"
                alt="Hackathon venue map"
                fill
                className="object-cover"
                priority
            />

            {/* Character Pins */}
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
              {/* Character Avatar Circle */}
              <div className="relative">
                {/* Ping animation */}
                <span className="absolute inset-0 rounded-full bg-pink-400 animate-ping opacity-60"></span>

                {/* Character Pin */}
                <div className="relative w-20 h-20 rounded-full border-4 border-white shadow-2xl hover:scale-110 transition-all cursor-pointer flex items-center justify-center"
                     style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                  <div className="text-3xl">👤</div>
                </div>

                {/* Character Info Tooltip */}
                <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 min-w-[220px] opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10 border border-white/50">
                  <div className="font-bold text-gray-900 text-lg">{character.name}</div>
                  <div className="text-sm text-gray-700 mb-2 font-medium">{character.title}</div>
                  <div className="text-xs text-gray-600 border-t border-gray-200 pt-2 mt-2">
                    🎯 {character.goal}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Character List Below Map */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {characters.map((character) => (
            <Link
              key={character.id}
              href={`/practice/${character.id}`}
              className="block group"
            >
              <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer border-2 border-white/20 hover:border-white/40 hover:scale-105 hover:bg-white/15">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg border-2 border-white"
                       style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                    👤
                  </div>
                  <div>
                    <div className="font-bold text-white text-lg">{character.name}</div>
                    <div className="text-sm text-white/80 font-medium">{character.title}</div>
                  </div>
                </div>
                <div className="text-sm text-white/70 leading-relaxed">{character.description}</div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
