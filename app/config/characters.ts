export interface Character {
  id: string;
  name: string;
  title: string;
  modelUrl: string;
  agentId?: string; // ElevenLabs agent ID - to be added later
  goal: string; // What the user should achieve in conversation
  description: string;
  position: { x: number; y: number }; // Position on the map (percentage)
}

export const characters: Character[] = [
  {
    id: "annoying-teammate",
    name: "Alex",
    title: "Annoying Teammate with Good Idea",
    modelUrl: "https://models.readyplayer.me/6918415bfb99478e41ab217d.glb",
    agentId: 'agent_6701ka3p5g34evav5h5yn3a1r98q', // TODO: Add ElevenLabs agent ID
    goal: "Listen to their idea and provide constructive feedback without dismissing them",
    description: "An enthusiastic teammate who has a genuinely good idea but presents it in an annoying way",
    position: { x: 25, y: 40 }
  },
  {
    id: "unmotivated-teammate",
    name: "Jordan",
    title: "Unmotivated Teammate",
    modelUrl: "https://models.readyplayer.me/691864cc672cca15c2fe3f3a.glb",
    agentId: 'agent_0301ka3p51kcevfvty4zjqxz2qz0', // TODO: Add ElevenLabs agent ID
    goal: "Motivate them to contribute to the project",
    description: "A team member who seems disengaged and needs motivation",
    position: { x: 75, y: 60 }
  },
  {
    id: "sassy-judge",
    name: "Morgan",
    title: "Sassy Judge",
    modelUrl: "https://models.readyplayer.me/6918653b8e7eb1274343a95d.glb",
    agentId: 'agent_1201ka3jnv0mea5bsqkt2gt1j4mz', // TODO: Add ElevenLabs agent ID
    goal: "Present your hackathon project confidently and handle their tough questions",
    description: "A judge with a sharp tongue who will challenge your project pitch",
    position: { x: 50, y: 25 }
  }
];
