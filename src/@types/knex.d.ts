// eslint-disable-next-line
import { knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
    }
    meals: {
      id: string
      name: string
      description: string | null
      date: Date
      is_on_the_diet: boolean
      user_id: string
    }
  }
}
