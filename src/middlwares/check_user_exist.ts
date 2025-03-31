import { FastifyReply, FastifyRequest } from 'fastify'

export async function checkUserExist(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { user } = request.cookies

  if (!user) {
    return reply.status(401).send({ error: 'Unauthorized' })
  }
}
