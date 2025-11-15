import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { messages, objectives, characterName } = await request.json();

    // Build the conversation history - only include last 10 messages for context
    const recentMessages = messages.slice(-10);
    const conversationHistory = recentMessages.map((msg: any) =>
      `${msg.source === 'user' ? 'User' : characterName}: ${msg.message}`
    ).join('\n');

    // Get the last 2-3 messages for emotion analysis
    const lastFewMessages = messages.slice(-3);
    const recentConversation = lastFewMessages.map((msg: any) =>
      `${msg.source === 'user' ? 'User' : characterName}: ${msg.message}`
    ).join('\n');

    // Create the analysis prompt
    const prompt = `You are analyzing a conversation between a user and ${characterName} in a hackathon simulator training app.

**Recent Conversation Context:**
${recentConversation}

**Full Conversation History (for objective assessment):**
${conversationHistory}

**Objectives to Evaluate:**
${objectives.map((obj: any) => `- ID: "${obj.id}" | Description: ${obj.description}`).join('\n')}

**Your Task:**
Analyze the conversation and return a JSON object with:
1. Objective completion status (based on full conversation)
2. Character's CURRENT emotion (based on the most recent 2-3 messages only)

**JSON Response Format:**
{
  "objectives": [
    { "id": "exact_id_from_above", "completed": true/false, "reason": "1 sentence explanation" }
  ],
  "emotion": "neutral" | "happy" | "sad" | "mad",
  "emotionReason": "1 sentence explaining the character's emotional reaction to the most recent exchange"
}

**Emotion Guidelines (analyze ONLY the last 2-3 messages):**
- "happy": Character is pleased, satisfied, feeling positive about what was just said
- "sad": Character is disappointed, discouraged, feeling down about the recent interaction
- "mad": Character is frustrated, annoyed, or irritated by something that just happened
- "neutral": Default state - normal conversation without strong emotional triggers

**Important Rules:**
- Return an entry for EVERY objective listed (use exact "id" values)
- Emotion should reflect ${characterName}'s reaction to the MOST RECENT user message
- Be more responsive to emotional cues - don't default to "neutral" unless truly appropriate
- Consider ${characterName}'s personality and role in the hackathon
- Objective completion is cumulative (based on full conversation)
- Emotion is immediate (based on last 2-3 messages only)`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an empathetic conversation analyst specializing in emotional intelligence. You accurately detect emotions and assess objectives based on conversation dynamics. Always return valid JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error analyzing conversation:', error);
    return NextResponse.json(
      { error: 'Failed to analyze conversation' },
      { status: 500 }
    );
  }
}
