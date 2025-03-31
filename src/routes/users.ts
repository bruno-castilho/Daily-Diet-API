import { FastifyInstance } from 'fastify'

import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../lib/database'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
    })

    const { name } = createUserBodySchema.parse(request.body)

    const result = await knex('users')
      .insert({
        id: randomUUID(),
        name,
      })
      .returning('*')

    const user = result[0]
    reply.cookie('user', JSON.stringify(user), {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return reply.status(201).send()
  })

  app.get('/:id/meals', async (request) => {
    const getUserMealsParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getUserMealsParamsSchema.parse(request.params)
    const meals = await knex('meals').where({
      user_id: id,
    })

    return { meals }
  })

  app.get('/:id/meals/metrics', async (request) => {
    const getUserMealsParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getUserMealsParamsSchema.parse(request.params)
    const meals = await knex('meals')
      .where({
        user_id: id,
      })
      .orderBy('date', 'asc')

    const totalMeals = meals.length
    let totalMealsInDiet = 0
    let totalMealsNotInDiet = 0
    let maxMealsSequenceWithinTheDiet = 0

    let currentMaxMealsSequenceWithinTheDiet = 0
    meals.forEach((meal) => {
      if (meal.is_on_the_diet) {
        totalMealsInDiet += 1
        currentMaxMealsSequenceWithinTheDiet += 1
        if (
          currentMaxMealsSequenceWithinTheDiet > maxMealsSequenceWithinTheDiet
        ) {
          maxMealsSequenceWithinTheDiet = currentMaxMealsSequenceWithinTheDiet
        }
      }

      if (!meal.is_on_the_diet) {
        totalMealsNotInDiet += 1
        currentMaxMealsSequenceWithinTheDiet = 0
      }
    })

    return {
      totalMeals,
      totalMealsInDiet,
      totalMealsNotInDiet,
      maxMealsSequenceWithinTheDiet,
    }
  })
}
