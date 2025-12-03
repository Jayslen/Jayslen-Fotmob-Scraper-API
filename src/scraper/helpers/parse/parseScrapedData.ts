import path from 'node:path'
import fs from 'node:fs/promises'
import { InsertionEntity } from '../../types/core.js'
import { Team, Teams } from '../../types/Teams.js'

interface TeamData extends Team {
  country: string
}
let teamsData: TeamData[] = []
const { Teams } = InsertionEntity

export async function loadTeamsData() {
  if (teamsData.length > 0) return teamsData
  const cwd = process.cwd()
  const teamsPath = path.join(cwd, 'football-stats', 'teams')
  const teamsFiles = await fs.readdir(teamsPath)
  for (const file of teamsFiles) {
    const filePath = path.join(teamsPath, file)
    const fileData = await fs.readFile(filePath, 'utf-8')
    const jsonData = JSON.parse(fileData) as Teams
    const teams = jsonData.teams.map((team) => ({
      ...team,
      country: jsonData.country
    }))
    teamsData.push(...teams)
  }
  return teamsData
}
