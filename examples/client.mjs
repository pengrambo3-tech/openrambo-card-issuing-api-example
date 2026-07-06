const env = process.env
const base = env.OPENRAMBO_BASE_URL || 'https://openrambo.com/api/issuing/v1'
const command = process.argv[2] || 'products'
const cardId = env.OPENRAMBO_CARD_ID
const key = env.OPENRAMBO_API_KEY
if (!key) throw new Error('OPENRAMBO_API_KEY is required')
const routes = {
  products: ['GET', '/products'], cards: ['GET', '/cards'],
  create: ['POST', '/cards', { productId: env.OPENRAMBO_PRODUCT_ID, firstRechargeAmount: Number(env.OPENRAMBO_AMOUNT || 10) }],
  detail: ['GET', '/cards/' + cardId],
  topup: ['POST', '/cards/' + cardId + '/topup', { amount: Number(env.OPENRAMBO_AMOUNT || 10) }],
  freeze: ['POST', '/cards/' + cardId + '/freeze'], unfreeze: ['POST', '/cards/' + cardId + '/unfreeze'],
  transactions: ['GET', '/cards/' + cardId + '/transactions?page=1&page_size=20'],
}
if (!routes[command]) throw new Error('Unknown command: ' + command)
const [method, route, body] = routes[command]
const headers = { 'X-API-Key': key, Accept: 'application/json' }
if (body) headers['Content-Type'] = 'application/json'
if (method !== 'GET') headers['Idempotency-Key'] = env.OPENRAMBO_IDEMPOTENCY_KEY || crypto.randomUUID()
const response = await fetch(base + route, { method, headers, body: body ? JSON.stringify(body) : undefined })
const payload = await response.json().catch(() => ({}))
console.log(JSON.stringify({ status: response.status, payload }, null, 2))
if (!response.ok) process.exitCode = 1
