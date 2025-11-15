"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams } from 'next/navigation'
import { useConversation } from "@elevenlabs/react";
import { characters, Objective } from "@/app/config/characters";

type Emotion = "neutral" | "talking" | "happy" | "mad" | "sad";

interface ConversationMessage {
  source: 'user' | 'ai';
  message: string;
  timestamp: number;
}

export default function PracticePage() {
  const [emotion, setEmotion] = useState<Emotion>("neutral");
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<{ buffer: AudioBuffer; timestamp: number }[]>([]);
  const isPlayingRef = useRef(false);
  const params = useParams<{ scenario: string }>();

  // Find the character based on the route parameter
  const character = characters.find(c => c.id === params.scenario);
  const agentId = character?.agentId || process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

  // Load objectives from localStorage or character config
  useEffect(() => {
    if (!character) return;

    const storageKey = `objectives_${character.id}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      setObjectives(JSON.parse(stored));
    } else {
      setObjectives(character.objectives);
    }
  }, [character]);

  // Save objectives to localStorage whenever they change
  useEffect(() => {
    if (!character || objectives.length === 0) return;
    const storageKey = `objectives_${character.id}`;
    localStorage.setItem(storageKey, JSON.stringify(objectives));
  }, [objectives, character]);

  // Analyze conversation periodically
  const analyzeConversation = useCallback(async () => {
    if (!character || conversationMessages.length < 2 || isAnalyzing) {
      console.log('⏭️ Skipping analysis:', {
        hasCharacter: !!character,
        messageCount: conversationMessages.length,
        isAnalyzing
      });
      return;
    }

    console.log('🔍 Starting analysis...');
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationMessages,
          objectives: objectives,
          characterName: character.name
        })
      });

      const analysis = await response.json();
      console.log('📊 Analysis received:', analysis);

      // Update objectives based on analysis
      if (analysis.objectives) {
        console.log('🎯 Updating objectives:', analysis.objectives);
        setObjectives(prev => {
          const updated = prev.map(obj => {
            const analyzed = analysis.objectives.find((a: any) => a.id === obj.id);
            if (analyzed) {
              console.log(`  - ${obj.id}: ${obj.completed} -> ${analyzed.completed} (${analyzed.reason})`);
              return { ...obj, completed: analyzed.completed };
            }
            return obj;
          });
          console.log('✅ New objectives state:', updated);
          return updated;
        });
      }

      // Update emotion based on analysis
      if (analysis.emotion && analysis.emotion !== 'talking') {
        console.log('😊 Updating emotion to:', analysis.emotion, '(', analysis.emotionReason, ')');
        setEmotion(analysis.emotion);
      }
    } catch (err) {
      console.error('Failed to analyze conversation:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [character, conversationMessages, objectives, isAnalyzing]);

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
      console.log("📨 Message received:", {
        source: message.source,
        message: message.message?.substring(0, 100)
      });

      // Store message for analysis
      if (message.message) {
        setConversationMessages(prev => [...prev, {
          source: message.source,
          message: message.message,
          timestamp: Date.now()
        }]);
      }
    },
    onError: (error) => {
      console.error("❌ ElevenLabs Error:", error);
      setError(error);
    },
    onModeChange: (mode) => {
      console.log("🔄 Mode changed to:", mode);
    }
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

        // @ts-ignore - Dynamic CDN import
        const module = await import(/* webpackIgnore: true */ "https://cdn.jsdelivr.net/gh/met4citizen/TalkingHead@1.5/modules/talkinghead.mjs");
        const TalkingHead = module.TalkingHead;

        // Initialize with TTS endpoint (required by TalkingHead)
        // Set mixerGainSpeech to 0 to mute TalkingHead's audio while keeping lip-sync
        headRef.current = new TalkingHead(avatarRef.current, {
          ttsEndpoint: "https://eu-texttospeech.googleapis.com/v1beta1/text:synthesize",
          ttsApikey: process.env.NEXT_PUBLIC_GOOGLE_TTS_API_KEY || "",
          lipsyncModules: ["en"],
          cameraView: "upper",
          mixerGainSpeech: 0, // Mute TalkingHead's speech audio (keeps ElevenLabs audio)
        });

        // Initialize AudioContext for audio processing
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Use character's specific Ready Player Me model
        const avatarUrl = character?.modelUrl || 'https://models.readyplayer.me/6918415bfb99478e41ab217d.glb';
        const fullAvatarUrl = avatarUrl.includes('?')
          ? `${avatarUrl}&morphTargets=ARKit,Oculus+Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureSizeLimit=1024&textureFormat=png`
          : `${avatarUrl}?morphTargets=ARKit,Oculus+Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureSizeLimit=1024&textureFormat=png`;

        await headRef.current.showAvatar({
          url: fullAvatarUrl,
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

  // Monitor conversation state and update avatar talking animation
  useEffect(() => {
    if (conversation.isSpeaking && headRef.current) {
      console.log("🗣️ Agent is speaking - avatar should show talking animation");
      setEmotion("talking");
      // TalkingHead will automatically show subtle mouth movements in talking state
    } else if (!conversation.isSpeaking && headRef.current) {
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

  // Trigger analysis every 4 messages (2 exchanges)
  useEffect(() => {
    if (conversationMessages.length > 0 && conversationMessages.length % 4 === 0) {
      analyzeConversation();
    }
  }, [conversationMessages, analyzeConversation]);

  const startConversation = useCallback(async () => {
    if (!agentId) {
      setError("Missing agent ID");
      return;
    }

    try {
      await conversation.startSession({
        agentId: agentId,
        connectionType: "websocket" as const,
      });
    } catch (err) {
      console.error("Failed to start conversation:", err);
      setError(err instanceof Error ? err.message : "Failed to start");
    }
  }, [agentId, conversation]);

  // Auto-start conversation when avatar loads
  useEffect(() => {
    if (!loading && !error && conversation.status === "disconnected" && agentId) {
      console.log("🚀 Auto-starting conversation");
      startConversation();
    }
  }, [loading, error, conversation.status, agentId, startConversation]);

  const handleEmotionClick = (newEmotion: Emotion) => {
    setEmotion(newEmotion);
  };

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

  if (!character) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-purple-600">
        <div className="text-white text-xl">
          Error: Character not found
        </div>
      </div>
    );
  }

  if (!agentId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-purple-600">
        <div className="text-white text-xl text-center p-8">
          <p className="mb-4">⚠️ Agent ID not configured for {character.name}</p>
          <p className="text-sm">Please add the ElevenLabs agent ID in the character configuration</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--gradient-bg)' }}>
      <main className="relative w-full max-w-md mx-auto h-screen flex flex-col">
        {/* Back Button - Top */}
        <div className="p-4 flex items-center">
          <Link
            href="/"
            className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all text-sm font-semibold hover:scale-105"
          >
            ← Back
          </Link>
        </div>

        {/* Header with Character Info */}
        <div className="px-6 pb-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">{character.name}</h1>
          <p className="text-sm text-white/90 font-medium">{character.title}</p>
        </div>

        {/* Objectives Checklist */}
        <div className="px-6 pb-3">
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl">
            <div className="text-white text-xs font-bold tracking-wider mb-3 flex items-center justify-between">
              <span>OBJECTIVES</span>
              {isAnalyzing && (
                <div className="flex items-center gap-1.5 text-white/80">
                  <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span className="text-xs">Analyzing...</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {objectives.map((objective) => (
                <label
                  key={objective.id}
                  className="flex items-start gap-3 text-white text-sm group"
                >
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={objective.completed}
                      disabled
                      className="w-5 h-5 rounded-md border-2 border-white/40 bg-white/10 checked:bg-gradient-to-br checked:from-green-400 checked:to-emerald-500 checked:border-green-400 appearance-none cursor-default transition-all"
                    />
                    {objective.completed && (
                      <svg className="w-3 h-3 text-white absolute top-1 left-1 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`flex-1 leading-snug ${objective.completed ? 'line-through opacity-70' : 'opacity-100'}`}>
                    {objective.description}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Avatar */}
        <div className="flex-1 flex items-center justify-center relative min-h-0">
          <div
            ref={avatarRef}
            className="w-full h-full"
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

        {/* Connection Status */}
        <div className="px-6 py-3 text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all ${
            conversation.status === "connected"
              ? "bg-emerald-500/90 border-emerald-400/50 text-white shadow-lg shadow-emerald-500/20"
              : "bg-white/10 border-white/20 text-white/80"
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              conversation.status === "connected" ? "bg-white animate-pulse shadow-lg shadow-white/50" : "bg-white/50"
            }`}></div>
            <span>
              {conversation.status === "connected" ? "Live" : "Connecting..."}
              {conversation.isSpeaking && " • Speaking"}
            </span>
          </div>
        </div>

        {/* Hidden: Emotion buttons (commented out) */}
        {/* <div className="px-6 py-2 flex gap-2 justify-center flex-wrap">
          <button onClick={() => handleEmotionClick("neutral")} className="px-3 py-1 rounded-full text-xs">Neutral</button>
          <button onClick={() => handleEmotionClick("happy")} className="px-3 py-1 rounded-full text-xs">Happy</button>
          <button onClick={() => handleEmotionClick("mad")} className="px-3 py-1 rounded-full text-xs">Mad</button>
          <button onClick={() => handleEmotionClick("sad")} className="px-3 py-1 rounded-full text-xs">Sad</button>
        </div> */}

        {/* Bottom spacing */}
        <div className="h-8"></div>
      </main>
    </div>
  );
}
