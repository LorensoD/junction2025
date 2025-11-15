"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type Emotion = "neutral" | "talking" | "happy" | "mad" | "sad";

export default function PracticePage({ params }: { params: { scenario: string } }) {
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [emotion, setEmotion] = useState<Emotion>("neutral");
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string>("");
  const avatarRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<any>(null);

  const scenarioTitles: Record<string, string> = {
    "sell-pen": "Sell this pen",
    "salary": "Salary discussion",
    "pickup": "Pick up a girl at club",
  };

  useEffect(() => {
    const loadImportMap = () => {
      // Check if import map already exists
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

        // Wait a bit for import map to be processed
        await new Promise(resolve => setTimeout(resolve, 100));

        // Dynamic import of TalkingHead
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

  const handleEmotionClick = (newEmotion: Emotion) => {
    setEmotion(newEmotion);
    if (newEmotion === "talking" && headRef.current) {
      headRef.current.speakText("Niclas how about you shut the fuck up");
    }
  };

    const talk = ()=> {
        headRef.current.speakText("Hi there. How are you? I'm fine.");
        headRef.current.speakText("It's so great to meet you");
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
              onClick={() => handleEmotionClick("neutral")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                emotion === "neutral" ? "bg-white text-purple-600" : "bg-white/20 text-white"
              }`}
            >
              Neutral
            </button>
            <button
              onClick={() => handleEmotionClick("talking")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                emotion === "talking" ? "bg-white text-purple-600" : "bg-white/20 text-white"
              }`}
            >
              Talking
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

              <button
                  onClick={() => talk()}
              >
                  SPEAK!
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
