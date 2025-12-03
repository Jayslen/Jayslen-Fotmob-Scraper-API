import DB from '../dbInstance.js'
import { dbTableInfo } from '../config.js'
import { handleInsertion } from '../helpers/db/insertion.command.js'
import { InsertionEntity } from '../types/core.js'

export async function InsertionDB(entities: InsertionEntity[]) {
  const db = await DB.getInstance()
  for (const entity of entities) {
    const { table, columns } = dbTableInfo[entity]
    await handleInsertion(entity, table, columns)
  }
  await db.end()
}
