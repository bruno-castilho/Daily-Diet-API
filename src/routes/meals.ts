import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../lib/database'
import { checkUserExist } from '../middlwares/check_user_exist'

export async function mealsRoutes(app: FastifyInstance) {
  app.get('/:id', { preHandler: [checkUserExist] }, async (request) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealParamsSchema.parse(request.params)

    const user = JSON.parse(request.cookies.user || '{}')
    const meal = await knex('meals').where({ id, user_id: user.id }).first()

    return meal
  })

  app.post('/', { preHandler: [checkUserExist] }, async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string().optional(),
      date: z.string().datetime(),
      isOnTheDiet: z.boolean(),
    })

    const { name, date, isOnTheDiet, description } = createMealBodySchema.parse(
      request.body,
    )

    const user = JSON.parse(request.cookies.user || '{}')
    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      date: new Date(date),
      is_on_the_diet: isOnTheDiet,
      user_id: user.id,
    })

    return reply.status(201).send()
  })

  app.put('/:id', { preHandler: [checkUserExist] }, async (request, reply) => {
    const updateMealBodySchema = z.object({
      name: z.string(),
      description: z.string().optional(),
      date: z.string().datetime(),
      isOnTheDiet: z.boolean(),
    })

    const updateMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { name, date, isOnTheDiet, description } = updateMealBodySchema.parse(
      request.body,
    )

    const { id } = updateMealParamsSchema.parse(request.params)

    const user = JSON.parse(request.cookies.user || '{}')
    await knex('meals')
      .update({
        name,
        description,
        date: new Date(date),
        is_on_the_diet: isOnTheDiet,
      })
      .where({ id, user_id: user.id })

    return reply.status(204).send()
  })

  app.delete(
    '/:id',
    { preHandler: [checkUserExist] },
    async (request, reply) => {
      const deleteMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = deleteMealParamsSchema.parse(request.params)

      const user = JSON.parse(request.cookies.user || '{}')
      await knex('meals').delete().where({ id, user_id: user.id })

      return reply.status(204).send()
    },
  )
}
