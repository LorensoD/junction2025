export interface Objective {
  id: string;
  description: string;
  completed: boolean;
}

export interface Character {
  id: string;
  name: string;
  title: string;
  modelUrl: string;
  agentId?: string; // ElevenLabs agent ID
  goal: string; // Overall goal
  objectives: Objective[]; // Specific tasks/challenges to complete
  description: string;
  position: { x: number; y: number }; // Position on the map (percentage)
}

export const characters: Character[] = [
  {
    id: "opposing-teammate",
    name: "Michael",
    title: "Opposing teammate",
    modelUrl: "https://models.readyplayer.me/6918415bfb99478e41ab217d.glb",
    agentId: 'agent_6701ka3p5g34evav5h5yn3a1r98q',
    goal: "Listen to their idea and provide constructive feedback without dismissing them",
    objectives: [
      { id: "listen", description: "Listen to Alex's full idea without interrupting", completed: false },
      { id: "acknowledge", description: "Acknowledge the good aspects of the idea", completed: false },
      { id: "suggest", description: "Provide constructive suggestions for improvement", completed: false }
    ],
    description: "An enthusiastic teammate who has a genuinely good idea but presents it in an annoying way",
    position: { x: 25, y: 40 }
  },
  {
    id: "unmotivated-teammate",
    name: "John",
    title: "Unmotivated Teammate",
    modelUrl: "https://models.readyplayer.me/691864cc672cca15c2fe3f3a.glb",
    agentId: 'agent_0301ka3p51kcevfvty4zjqxz2qz0',
    goal: "Motivate them to contribute to the project",
    objectives: [
      { id: "understand", description: "Understand why Jordan is unmotivated", completed: false },
      { id: "encourage", description: "Find something that excites Jordan about the project", completed: false }
    ],
    description: "A team member who seems disengaged and needs motivation",
    position: { x: 75, y: 60 }
  },
  {
    id: "judge",
    name: "Nadia",
    title: "Judge",
    modelUrl: "https://models.readyplayer.me/6918653b8e7eb1274343a95d.glb",
    agentId: 'agent_1201ka3jnv0mea5bsqkt2gt1j4mz',
    goal: "Present your hackathon project confidently and handle their tough questions",
    objectives: [
      { id: "pitch", description: "Deliver a clear and confident pitch", completed: false },
      { id: "handle-criticism", description: "Handle Morgan's tough questions professionally", completed: false },
      { id: "defend", description: "Defend your project's value proposition", completed: false }
    ],
    description: "A judge with a sharp tongue who will challenge your project pitch",
    position: { x: 50, y: 25 }
  }
];
