import fastify from 'fastify'
import cookie from '@fastify/cookie'

export const app = fastify()

app.register(cookie)

app.addHook('preHandler', async (request) => {
  console.log(`[${request.method}] ${request.url}`)
})
