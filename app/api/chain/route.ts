import { NextRequest, NextResponse } from 'next/server';
import { getChain } from '@/lib/kv';

// Use nodejs runtime for in-memory storage (local dev)
// Switch to 'edge' when using Vercel KV in production
export const runtime = 'nodejs';

/**
 * GET /api/chain
 * Returns blockchain with optional pagination
 * Query params:
 *   - limit: number of blocks to return (default: all)
 *   - offset: number of blocks to skip (default: 0)
 *   - reverse: return newest first (default: false)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;
    const reverse = searchParams.get('reverse') === 'true';

    let chain = await getChain();
    const totalBlocks = chain.length;

    // Reverse if requested (newest first)
    if (reverse) {
      chain = [...chain].reverse();
    }

    // Apply pagination
    if (limit !== undefined) {
      chain = chain.slice(offset, offset + limit);
    }

    return NextResponse.json({
      blocks: chain,
      pagination: {
        total: totalBlocks,
        limit: limit || totalBlocks,
        offset,
        hasMore: limit ? (offset + limit < totalBlocks) : false,
      },
    });
  } catch (error) {
    console.error('Error fetching chain:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blockchain' },
      { status: 500 }
    );
  }
}
