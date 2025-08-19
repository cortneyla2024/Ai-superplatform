import { NextRequest, NextResponse } from 'next/server';
import { OllamaClient } from '@/lib/ai/ollama-client';
import { AuthService } from '@/lib/auth';
import { db } from '@/lib/db/file-db';
import { z } from 'zod';

const ChatSchema = z.object({
  message: z.string().min(1).max(1000),
  context: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await AuthService.authenticate(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { message, context } = ChatSchema.parse(body);

    const ollamaClient = new OllamaClient();
    const response = await ollamaClient.chat(message, context);

    // Save chat messages to database
    await db.createChatMessage({
      userId: user.id,
      content: message,
      isAI: false,
    });

    await db.createChatMessage({
      userId: user.id,
      content: response,
      isAI: true,
    });

    return NextResponse.json({
      success: true,
      response,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 }
      );
    }

    console.error('AI chat error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
