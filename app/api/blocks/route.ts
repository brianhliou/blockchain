import { NextRequest, NextResponse } from 'next/server';
import { getLatestBlock, appendBlock } from '@/lib/kv';
import { computeHash, isBlockChainValid } from '@/lib/crypto';
import { Block } from '@/lib/types';
import { checkRateLimit } from '@/lib/ratelimit';

// Use nodejs runtime for in-memory storage (local dev)
// Switch to 'edge' when using Vercel KV in production
export const runtime = 'nodejs';

/**
 * POST /api/blocks
 * Validates and appends a new block to the chain with proof-of-work
 * Rate-limited per IP address
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting - get IP from headers
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1';
    const { success, limit, reset, remaining } = await checkRateLimit(ip);

    if (!success) {
      return NextResponse.json(
        {
          error: 'rate_limited',
          message: 'Too many requests. Please try again later.',
          limit,
          remaining,
          reset,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const { data, nonce, timestamp } = body;

    // Validate input
    if (!data || typeof data !== 'string' || data.trim().length === 0) {
      return NextResponse.json(
        {
          error: 'invalid_data',
          message: 'Block data must be a non-empty string',
        },
        { status: 400 }
      );
    }

    if (data.length > 1000) {
      return NextResponse.json(
        {
          error: 'invalid_data',
          message: 'Block data must be 1000 characters or less',
        },
        { status: 400 }
      );
    }

    // Validate nonce
    if (typeof nonce !== 'number' || nonce < 0 || !Number.isInteger(nonce)) {
      return NextResponse.json(
        {
          error: 'invalid_nonce',
          message: 'Nonce must be a non-negative integer',
        },
        { status: 400 }
      );
    }

    // Validate timestamp
    if (!timestamp || typeof timestamp !== 'string') {
      return NextResponse.json(
        {
          error: 'invalid_timestamp',
          message: 'Timestamp is required',
        },
        { status: 400 }
      );
    }

    // Get previous block
    const prevBlock = await getLatestBlock();

    // Create new block with provided nonce and timestamp
    const newBlock: Block = {
      index: prevBlock.index + 1,
      timestamp,
      data: data.trim(),
      prevHash: prevBlock.hash,
      nonce,
      hash: '',
    };

    // Compute hash with nonce
    newBlock.hash = await computeHash(
      newBlock.index,
      newBlock.timestamp,
      newBlock.data,
      newBlock.prevHash,
      newBlock.nonce
    );

    // Validate new block (includes proof-of-work check)
    const isValid = await isBlockChainValid(newBlock, prevBlock);
    if (!isValid) {
      return NextResponse.json(
        {
          error: 'invalid_block',
          message: 'Block validation failed - proof-of-work does not meet difficulty requirement',
        },
        { status: 400 }
      );
    }

    // Append to chain
    await appendBlock(newBlock);

    return NextResponse.json(newBlock, {
      status: 201,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
      },
    });
  } catch (error) {
    console.error('Error creating block:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to create block' },
      { status: 500 }
    );
  }
}
