// Supabase Edge Function: AI proxy for the Finance Tracker.
//
// This is the ONLY place the Claude API key lives. The browser calls this
// function (authenticated as the logged-in user via Supabase); the function
// calls Claude server-side and returns structured JSON or prose. The key is
// never exposed to the client.
//
// Deploy:
//   supabase functions deploy ai
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
// Deno runtime — no build step, no SDK needed.

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
const MODEL = 'claude-opus-4-8'
const API_URL = 'https://api.anthropic.com/v1/messages'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

// Call Claude. `schema` (optional) forces structured JSON output; otherwise
// prose text is returned. `thinking` enables adaptive reasoning for the
// analysis operations.
async function callClaude(opts: {
  system: string
  user: string
  schema?: Record<string, unknown>
  thinking?: boolean
  maxTokens?: number
}): Promise<string> {
  const body: Record<string, unknown> = {
    model: MODEL,
    max_tokens: opts.maxTokens ?? 1024,
    system: opts.system,
    messages: [{ role: 'user', content: opts.user }],
  }
  if (opts.schema) {
    body.output_config = {
      format: { type: 'json_schema', schema: opts.schema },
    }
  }
  if (opts.thinking) {
    body.thinking = { type: 'adaptive' }
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`Claude API error ${res.status}: ${detail}`)
  }

  const data = await res.json()
  const textBlock = (data.content ?? []).find((b: { type: string }) => b.type === 'text')
  return textBlock?.text ?? ''
}

const txSchema = (categories: string[]) => ({
  type: 'object',
  additionalProperties: false,
  properties: {
    type: { type: 'string', enum: ['income', 'expense'] },
    amount: { type: 'number' },
    category: { type: 'string', enum: categories },
    description: { type: 'string' },
    date: { type: 'string', description: 'YYYY-MM-DD' },
  },
  required: ['type', 'amount', 'category', 'description', 'date'],
})

async function handle(op: string, p: Record<string, unknown>) {
  switch (op) {
    case 'parse': {
      const cats = [
        ...(p.categories?.expense ?? []),
        ...(p.categories?.income ?? []),
      ]
      const text = await callClaude({
        system:
          `You extract a single financial transaction from natural language. ` +
          `Amounts are in FCFA. Today is ${p.today}. Resolve relative dates ` +
          `("yesterday", "last friday") to an absolute YYYY-MM-DD. Choose the ` +
          `closest category from the allowed list. Infer income vs expense from context.`,
        user: String(p.text),
        schema: txSchema(cats),
      })
      return JSON.parse(text)
    }

    case 'categorize': {
      const list = (p.categories as string[]) ?? []
      const text = await callClaude({
        system:
          `Pick the single best-fit category for a ${p.type} transaction ` +
          `from the allowed list. Respond with the category only.`,
        user: `Description: ${p.description}`,
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: { category: { type: 'string', enum: list } },
          required: ['category'],
        },
      })
      return JSON.parse(text)
    }

    case 'insights': {
      const text = await callClaude({
        system:
          `You are a concise personal-finance analyst. Given period totals, ` +
          `write 2-4 short sentences of plain-English insight: where money went, ` +
          `notable changes vs the previous period, and one actionable observation. ` +
          `Amounts are in FCFA. No preamble, no markdown headers.`,
        user: JSON.stringify(p.stats),
        thinking: true,
        maxTokens: 700,
      })
      return { text: text.trim() }
    }

    case 'budget': {
      const text = await callClaude({
        system:
          `You are a budgeting assistant. Given per-category spending totals and ` +
          `recent transactions (amounts in FCFA), suggest a sensible monthly budget ` +
          `per category and flag any anomalies (charges well above the norm). ` +
          `Return JSON only.`,
        user: JSON.stringify({
          categoryTotals: p.categoryTotals,
          transactions: p.transactions,
        }),
        thinking: true,
        maxTokens: 1500,
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            budgets: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  category: { type: 'string' },
                  suggested: { type: 'number' },
                  rationale: { type: 'string' },
                },
                required: ['category', 'suggested', 'rationale'],
              },
            },
            anomalies: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  description: { type: 'string' },
                  amount: { type: 'number' },
                  reason: { type: 'string' },
                },
                required: ['description', 'amount', 'reason'],
              },
            },
          },
          required: ['budgets', 'anomalies'],
        },
      })
      return JSON.parse(text)
    }

    default:
      throw new Error(`Unknown op: ${op}`)
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  if (!ANTHROPIC_API_KEY) return json({ error: 'ANTHROPIC_API_KEY not set' }, 500)

  try {
    const { op, ...payload } = await req.json()
    const result = await handle(op, payload)
    return json(result)
  } catch (err) {
    return json({ error: (err as Error).message }, 400)
  }
})
