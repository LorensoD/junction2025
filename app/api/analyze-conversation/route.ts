import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { messages, objectives, characterName } = await request.json();

    // Build the conversation history
    const conversationHistory = messages.map((msg: any) =>
      `${msg.source === 'user' ? 'User' : characterName}: ${msg.message}`
    ).join('\n');

    // Create the analysis prompt
    const prompt = `You are analyzing a conversation to determine if specific objectives have been achieved and what emotion the AI character should display.

Character: ${characterName}

Conversation:
${conversationHistory}

Objectives to check:
${objectives.map((obj: any) => `- ID: "${obj.id}" | Description: ${obj.description}`).join('\n')}

Based on the conversation, respond with a JSON object with the following structure:
{
  "objectives": [
    { "id": "listen", "completed": true, "reason": "brief explanation" },
    { "id": "acknowledge", "completed": false, "reason": "brief explanation" }
  ],
  "emotion": "neutral" | "happy" | "sad" | "mad",
  "emotionReason": "brief explanation of why this emotion"
}

IMPORTANT: You MUST return an entry for EVERY objective listed above. Use the exact "id" values provided.

Guidelines:
- Mark an objective as completed if there's clear evidence in the conversation that it has been achieved
- For emotion: Choose "happy" if character is pleased/satisfied, "sad" if disappointed/upset, "mad" if frustrated/angry, "neutral" for normal conversation
- Be strict but fair in your assessment
- Base your analysis only on what has actually been said in the conversation
- Return results for ALL objectives, even if not completed yet`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a conversation analyst that provides objective assessments in JSON format.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
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
