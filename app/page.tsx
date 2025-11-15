import Link from "next/link";
import { characters } from "./config/characters";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <main className="w-full max-w-5xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2 text-gray-800">Junction Hackathon</h1>
          <p className="text-xl text-gray-600">Navigate the social challenges</p>
        </div>

        {/* Hackathon Map */}
        <div className="relative w-full aspect-video bg-gradient-to-b from-gray-200 to-gray-300 rounded-2xl shadow-2xl overflow-hidden border-4 border-gray-400">
          {/* Placeholder for map background - will be replaced with actual map later */}
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
            [Hackathon venue map will go here]
          </div>

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
                <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-75"></span>

                {/* Character Pin */}
                <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border-4 border-white shadow-lg hover:scale-110 transition-transform cursor-pointer flex items-center justify-center">
                  <div className="text-2xl">👤</div>
                </div>

                {/* Character Info Tooltip */}
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-xl p-3 min-w-[200px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="font-bold text-gray-800">{character.name}</div>
                  <div className="text-sm text-gray-600 mb-1">{character.title}</div>
                  <div className="text-xs text-gray-500 border-t pt-1 mt-1">
                    Goal: {character.goal}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Character List Below Map */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {characters.map((character) => (
            <Link
              key={character.id}
              href={`/practice/${character.id}`}
              className="block"
            >
              <div className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-400">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl">
                    👤
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{character.name}</div>
                    <div className="text-sm text-gray-600">{character.title}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">{character.description}</div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
