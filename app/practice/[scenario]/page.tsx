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
  const [isConnected, setIsConnected] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

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
      disconnectAgent();
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

  const connectToAgent = async () => {
    const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || "";
    const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || "";

    if (!agentId || !apiKey) {
      setError("Missing ElevenLabs credentials");
      return;
    }

    try {
      // Initialize audio context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create MediaRecorder for capturing audio
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });

      // Connect to ElevenLabs Conversational AI WebSocket
      const ws = new WebSocket(
        `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${agentId}`
      );

      ws.onopen = () => {
        console.log("Connected to ElevenLabs agent");
        setIsConnected(true);

        // Send initial config
        ws.send(JSON.stringify({
          type: "conversation_initiation_client_data",
          conversation_config_override: {
            agent: {
              prompt: {
                prompt: getScenarioPrompt(params.scenario)
              }
            }
          }
        }));
      };

      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "audio") {
          // Agent is speaking
          setEmotion("talking");

          // Decode base64 audio
          const audioData = atob(data.audio);
          const audioArray = new Uint8Array(audioData.length);
          for (let i = 0; i < audioData.length; i++) {
            audioArray[i] = audioData.charCodeAt(i);
          }

          // Play audio through TalkingHead
          if (headRef.current && audioContextRef.current) {
            const audioBuffer = await audioContextRef.current.decodeAudioData(audioArray.buffer);
            headRef.current.playAudio(audioBuffer);
          }
        } else if (data.type === "interruption") {
          // User interrupted the agent
          console.log("Agent interrupted");
          if (headRef.current) {
            headRef.current.stopSpeaking();
          }
        } else if (data.type === "agent_response_end") {
          setEmotion("neutral");
        } else if (data.type === "ping") {
          ws.send(JSON.stringify({ type: "pong", event_id: data.event_id }));
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("Connection error");
      };

      ws.onclose = () => {
        console.log("Disconnected from agent");
        setIsConnected(false);
        setEmotion("neutral");
      };

      wsRef.current = ws;

      // Send audio chunks to agent
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          // Convert to base64 and send
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Audio = (reader.result as string).split(',')[1];
            ws.send(JSON.stringify({
              type: "user_audio_chunk",
              audio: base64Audio
            }));
          };
          reader.readAsDataURL(event.data);
        }
      };

      // Start recording
      mediaRecorderRef.current.start(100); // Send chunks every 100ms

    } catch (err) {
      console.error("Failed to connect to agent:", err);
      setError(err instanceof Error ? err.message : "Connection failed");
    }
  };

  const disconnectAgent = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsConnected(false);
  };

  const toggleConnection = () => {
    if (isConnected) {
      disconnectAgent();
    } else {
      connectToAgent();
    }
  };

  const getScenarioPrompt = (scenario: string): string => {
    const prompts: Record<string, string> = {
      "sell-pen": "You are a potential customer at a store. A salesperson is trying to sell you a pen. Be somewhat skeptical but open to being convinced if they make good points. React naturally to their pitch.",
      "salary": "You are a hiring manager in a salary negotiation with a candidate. Be professional but firm about the company's budget constraints. Listen to their arguments and respond realistically.",
      "pickup": "You are at a club. Someone is trying to start a conversation with you. Be natural and react based on what they say - if they're respectful and interesting, be friendly. If they're inappropriate, respond accordingly."
    };
    return prompts[scenario] || prompts["sell-pen"];
  };

  const handleEmotionClick = (newEmotion: Emotion) => {
    setEmotion(newEmotion);
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

          {/* Connect/Disconnect button */}
          <button
            onClick={toggleConnection}
            disabled={loading}
            className={`w-full py-4 rounded-full font-semibold text-lg transition-colors ${
              isConnected
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isConnected ? "End Conversation" : "Start Conversation"}
          </button>

          <div className="text-white text-center text-sm rotate-90 absolute right-0 top-1/2 origin-right">
            interest-o-meter
          </div>
        </div>
      </main>
    </div>
  );
}
