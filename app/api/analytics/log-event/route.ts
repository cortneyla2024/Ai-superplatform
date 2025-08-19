import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsTracker } from '@/lib/analytics/tracker';
import { AuthService } from '@/lib/auth';
import { z } from 'zod';

const EventLogSchema = z.object({
  event: z.string().min(1).max(100),
  data: z.record(z.any()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    let userId: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const user = await AuthService.authenticate(token);
      userId = user?.id;
    }

    const body = await request.json();
    const { event, data } = EventLogSchema.parse(body);

    const analyticsTracker = new AnalyticsTracker();
    await analyticsTracker.logEvent(userId, event, data);

    return NextResponse.json({
      success: true,
      message: 'Event logged successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid event data' },
        { status: 400 }
      );
    }

    console.error('Analytics logging error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to log event' },
      { status: 500 }
    );
  }
}
