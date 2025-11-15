"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from 'next/navigation'
import { ConversationBar } from "@/components/ui/conversation-bar"

type Emotion = "neutral" | "talking" | "happy" | "mad" | "sad";

export default function PracticePage() {
  const [emotion, setEmotion] = useState<Emotion>("neutral");
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<any>(null);
  const params = useParams<{ scenario: string }>();

  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

  const scenarioTitles: Record<string, string> = {
    "sell-pen": "Sell this pen",
    "salary": "Salary discussion",
    "pickup": "Pick up a girl at club",
  };

  useEffect(() => {
    const loadImportMap = () => {
      if (document.querySelector('script[type="importmap"]')) {
        return;
      }

      const importMap = document.createElement('script');
      importMap.type = 'importmap';
      importMap.textContent = JSON.stringify({
        imports: {
          "three": "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js/+esm",
          "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/",
          "talkinghead": "https://cdn.jsdelivr.net/gh/met4citizen/TalkingHead@1.5/modules/talkinghead.mjs"
        }
      });
      document.head.appendChild(importMap);
    };

    const initAvatar = async () => {
      if (!avatarRef.current || headRef.current) return;

      try {
        loadImportMap();
        await new Promise(resolve => setTimeout(resolve, 100));

        const module = await import(/* webpackIgnore: true */ "https://cdn.jsdelivr.net/gh/met4citizen/TalkingHead@1.5/modules/talkinghead.mjs");
        const TalkingHead = module.TalkingHead;

        headRef.current = new TalkingHead(avatarRef.current, {
          ttsEndpoint: "https://eu-texttospeech.googleapis.com/v1beta1/text:synthesize",
          ttsApikey: process.env.NEXT_PUBLIC_GOOGLE_TTS_API_KEY || "",
          lipsyncModules: ["en"],
          cameraView: "upper"
        });

        await headRef.current.showAvatar({
          url: 'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb?morphTargets=ARKit,Oculus+Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureSizeLimit=1024&textureFormat=png',
          body: 'F',
          avatarMood: 'neutral',
          ttsLang: "en-GB",
          ttsVoice: "en-GB-Standard-A",
          lipsyncLang: 'en'
        }, (ev: any) => {
          if (ev.lengthComputable) {
            const progress = Math.min(100, Math.round(ev.loaded / ev.total * 100));
            setLoadingProgress(progress);
          }
        });

        setLoading(false);
      } catch (err) {
        console.error("Failed to load avatar:", err);
        setError(err instanceof Error ? err.message : "Failed to load avatar");
        setLoading(false);
      }
    };

    initAvatar();

    return () => {
      if (headRef.current) {
        headRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (headRef.current && !loading) {
      const moodMap: Record<Emotion, string> = {
        neutral: "neutral",
        talking: "neutral",
        happy: "happy",
        mad: "angry",
        sad: "sad"
      };
      headRef.current.setMood(moodMap[emotion]);
    }
  }, [emotion, loading]);

  const handleEmotionClick = (newEmotion: Emotion) => {
    setEmotion(newEmotion);
  };

  if (!agentId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-purple-600">
        <div className="text-white text-xl">
          Error: Missing NEXT_PUBLIC_ELEVENLABS_AGENT_ID in environment variables
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-purple-600">
      <main className="relative w-full max-w-md h-screen flex flex-col">
        {/* Header */}
        <div className="p-6 text-center">
          <h1 className="text-3xl font-bold text-white">Scenario:</h1>
          <h2 className="text-3xl font-bold text-white">
            {scenarioTitles[params.scenario || "sell-pen"] || "Unknown"}
          </h2>
        </div>

        {/* Avatar */}
        <div className="flex-1 flex items-center justify-center relative">
          <div
            ref={avatarRef}
            className="w-full h-full max-h-[500px]"
            style={{ background: 'transparent' }}
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-xl font-semibold">
                {error ? `Error: ${error}` : `Loading Avatar ${loadingProgress}%`}
              </div>
            </div>
          )}
        </div>

        {/* Bottom controls */}
        <div className="p-6 flex flex-col gap-4">
          {/* Connection Status */}
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-gray-500"
            } text-white`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-white animate-pulse" : "bg-white/50"}`}></div>
              {isConnected ? "Connected to Agent" : "Not Connected"}
            </div>
          </div>

          {/* Emotion buttons */}
          <div className="flex gap-2 justify-center flex-wrap">
            <button
              onClick={() => handleEmotionClick("neutral")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                emotion === "neutral" ? "bg-white text-purple-600" : "bg-white/20 text-white"
              }`}
            >
              Neutral
            </button>
            <button
              onClick={() => handleEmotionClick("happy")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                emotion === "happy" ? "bg-white text-purple-600" : "bg-white/20 text-white"
              }`}
            >
              Happy
            </button>
            <button
              onClick={() => handleEmotionClick("mad")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                emotion === "mad" ? "bg-white text-purple-600" : "bg-white/20 text-white"
              }`}
            >
              Mad
            </button>
            <button
              onClick={() => handleEmotionClick("sad")}
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

          {/* ElevenLabs Conversation Bar */}
          <ConversationBar
            agentId={agentId}
            onConnect={() => {
              console.log("Connected to ElevenLabs agent");
              setIsConnected(true);
            }}
            onDisconnect={() => {
              console.log("Disconnected from ElevenLabs agent");
              setIsConnected(false);
              setEmotion("neutral");
            }}
            onMessage={(message) => {
              console.log("Message received:", message);
              if (message.source === 'ai' && message.message) {
                setEmotion("talking");
                if (headRef.current) {
                  headRef.current.speakText(message.message);
                }
                // Reset to neutral after speaking
                setTimeout(() => {
                  setEmotion("neutral");
                }, 3000);
              }
            }}
            onError={(error) => {
              console.error("ElevenLabs error:", error);
              setError(error.message || "Connection error");
              setIsConnected(false);
            }}
          />

          <div className="text-white text-center text-sm rotate-90 absolute right-0 top-1/2 origin-right">
            interest-o-meter
          </div>
        </div>
      </main>
    </div>
  );
}
