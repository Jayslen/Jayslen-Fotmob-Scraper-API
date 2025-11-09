import fs from 'node:fs/promises'
import { scrapeMatchResult } from './utils/scrapeMatch.js'
import { initializeBrowser } from './utils/initializeBrowser.js'

const { browser, page } = await initializeBrowser()

for (let i = 0; i < 1; i++) {
  await page.goto(
    `https://www.fotmob.com/leagues/47/matches/premier-league?season=2024-2025&group=by-round&round=${i}`,
    { waitUntil: 'load' }
  )
  const matchesRound = { league: '', round: '', season: '', matches: [] }
  const matchLinks = await page.$$eval('.e1mcimok0', (links) => {
    return links.map((link) => link.getAttribute('href'))
  })

  for (const link of matchLinks) {
    const response = page.waitForResponse(
      (res) =>
        res.url().includes('api/data/matchDetails') && res.status() === 200
    )
    await page.goto(`https://www.fotmob.com/${link}`, { waitUntil: 'load' })
    console.log('Waiting for response...')
    try {
      const matchResponse = await response
      const match = await scrapeMatchResult(matchResponse)
      if (!matchesRound.league) {
        matchesRound.league = match.details.league
        matchesRound.round = match.details.round
      }
      //@ts-ignore
      matchesRound.matches.push(match)
    } catch {
      console.log('Could not parse response as JSON')
    }
  }
  await fs.writeFile(
    `./debug/${matchesRound.league}-round-${matchesRound.round}.json`,
    JSON.stringify(matchesRound)
  )
}

await browser.close()
