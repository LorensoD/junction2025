"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams } from 'next/navigation'
import { useConversation } from "@elevenlabs/react";

type Emotion = "neutral" | "talking" | "happy" | "mad" | "sad";

export default function PracticePage() {
  const [emotion, setEmotion] = useState<Emotion>("neutral");
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const params = useParams<{ scenario: string }>();

  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

  const scenarioTitles: Record<string, string> = {
    "sell-pen": "Sell this pen",
    "salary": "Salary discussion",
    "pickup": "Pick up a girl at club",
  };

  // Initialize ElevenLabs Conversation
  const conversation = useConversation({
    onConnect: () => {
      console.log("✅ Connected to ElevenLabs");
    },
    onDisconnect: (reason) => {
      console.log("❌ Disconnected from ElevenLabs. Reason:", reason);
      setEmotion("neutral");
      if (isStreaming && headRef.current) {
        console.log("🛑 Stopping TalkingHead stream due to disconnect");
        headRef.current.streamStop();
        setIsStreaming(false);
      }
    },
    onMessage: (message) => {

        console.log(message, 'here is message')

        if(message.source === 'ai' && headRef.current) {
            // Trigger lip sync animation without audio playback
            // Audio is muted via avatarMute: true in initialization
            headRef.current.speakText(message.message);
        }

      console.log("📨 Message received:", {
        type: message.type,
        role: message.role,
        content: message.content?.substring(0, 100)
      });
    },
    onError: (error) => {
      console.error("❌ ElevenLabs Error:", error);
      setError(error.message);
    },
    onModeChange: (mode) => {
      console.log("🔄 Mode changed to:", mode);
    },
    onAudio: async (base64Audio) => {
        // console.log(base64Audio)
        //
        // headRef.current?.streamAudio({
        //     sampleRate: 16000,
        //     audio: base64Audio
        // });

      // ✨ This callback receives PCM audio chunks from ElevenLabs!
      // if (!headRef.current) return;
      //
      // try {
      //   // Start streaming session if not already started
      //   if (!isStreaming) {
      //     console.log("🎬 Starting TalkingHead stream from onAudio");
      //     await headRef.current.streamStart(
      //       {
      //         sampleRate: 16000, // ElevenLabs conversational AI uses 16kHz PCM
      //         lipsyncLang: 'en',
      //         lipsyncType: 'visemes',
      //         waitForAudioChunks: true,
      //         mood: 'neutral'
      //       },
      //       () => {
      //         console.log("🎤 TalkingHead playback started");
      //         setEmotion("talking");
      //         setIsStreaming(true);
      //       },
      //       () => {
      //         console.log("🛑 TalkingHead playback ended");
      //         setEmotion("neutral");
      //         setIsStreaming(false);
      //       }
      //     );
      //   }
      //
      //   // Send audio chunk to TalkingHead for lip-sync and playback
      //   if (headRef.current && (isStreaming || conversation.isSpeaking)) {
      //     headRef.current.streamAudio({
      //       audio: audioData // TalkingHead expects ArrayBuffer of Int16 PCM
      //     });
      //     console.log("📨 Streamed", audioData.byteLength, "bytes to TalkingHead");
      //   }
      // } catch (err) {
      //   console.error("❌ Error in onAudio:", err);
      // }
    },
  });

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

        // Initialize with TTS but we'll mute the audio output
        // Audio is only needed for lip sync, not for playback
        headRef.current = new TalkingHead(avatarRef.current, {
          ttsEndpoint: "https://eu-texttospeech.googleapis.com/v1beta1/text:synthesize",
          ttsApikey: process.env.NEXT_PUBLIC_GOOGLE_TTS_API_KEY || "",
          lipsyncModules: ["en"],
          cameraView: "upper",
          avatarMute: true  // Mute avatar's audio output
        });

        // Initialize AudioContext for audio processing
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

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

        // Mute all audio elements created by TalkingHead to prevent double audio
        // We only need lip sync, not audio playback
        const muteAvatarAudio = () => {
          const audioElements = document.querySelectorAll('audio');
          audioElements.forEach(audio => {
            audio.muted = true;
            audio.volume = 0;
          });
        };
        muteAvatarAudio();
        
        // Set up mutation observer to mute any new audio elements
        const observer = new MutationObserver(muteAvatarAudio);
        observer.observe(document.body, { childList: true, subtree: true });

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
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Monitor conversation state
  useEffect(() => {
    console.log("📊 Conversation state:", {
      status: conversation.status,
      isSpeaking: conversation.isSpeaking,
      isStreaming: isStreaming
    });
  }, [conversation.status, conversation.isSpeaking, isStreaming]);

  // Don't auto-start streaming - ElevenLabs handles audio playback
  // We'll just update the emotion state based on speaking
  useEffect(() => {
    if (conversation.isSpeaking) {
      console.log("🗣️ Agent is speaking");
      setEmotion("talking");
    } else {
      console.log("🤐 Agent stopped speaking");
      setEmotion("neutral");
    }
  }, [conversation.isSpeaking]);

  // Clean up streaming when conversation ends
  useEffect(() => {
    if (conversation.status === "disconnected" && isStreaming && headRef.current) {
      console.log("🧹 Cleaning up TalkingHead stream");
      headRef.current.streamStop();
      setIsStreaming(false);
    }
  }, [conversation.status, isStreaming]);

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

  const startConversation = useCallback(async () => {
    if (!agentId) {
      setError("Missing agent ID");
      return;
    }

    try {
      await conversation.startSession({
        agentId: agentId,
      });
    } catch (err) {
      console.error("Failed to start conversation:", err);
      setError(err instanceof Error ? err.message : "Failed to start");
    }
  }, [agentId, conversation]);

  const endConversation = useCallback(async () => {
    try {
      console.log("🛑 Ending conversation");
      await conversation.endSession();
      setEmotion("neutral");
      setIsStreaming(false);
    } catch (err) {
      console.error("Failed to end conversation:", err);
    }
  }, [conversation]);

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
              conversation.status === "connected" ? "bg-green-500" : "bg-gray-500"
            } text-white`}>
              <div className={`w-2 h-2 rounded-full ${
                conversation.status === "connected" ? "bg-white animate-pulse" : "bg-white/50"
              }`}></div>
              {conversation.status === "connected" ? "Connected" : "Not Connected"}
              {conversation.isSpeaking && " - Speaking"}
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

          {/* Start/End Conversation button */}
          <button
            onClick={conversation.status === "connected" ? endConversation : startConversation}
            disabled={loading || conversation.status === "connecting"}
            className={`w-full py-4 rounded-full font-semibold text-lg transition-colors ${
              conversation.status === "connected"
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {conversation.status === "connecting"
              ? "Connecting..."
              : conversation.status === "connected"
                ? "End Conversation"
                : "Start Conversation"}
          </button>

          <div className="text-white text-center text-sm rotate-90 absolute right-0 top-1/2 origin-right">
            interest-o-meter
          </div>
        </div>
      </main>
    </div>
  );
}
