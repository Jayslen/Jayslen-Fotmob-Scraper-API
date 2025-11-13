import { scrapeMatchResult } from '../parse/parseMatchData.js'
import { newPage } from '../utils/createNewPage.js'
import { writeData } from '../utils/writeFiles.js'
import { League, MatchParsed } from '../types/matchParsed.js'

export class Commands {
  static async ScrapeMatches(input: {
    league: { acrom: string; id: number; name: string }
    from: number
    to: number
    season: string
  }) {
    const { league, from, to, season } = input
    const { page, browser } = await newPage()
    console.log(
      `Starting to scrape matches for ${league.name} season ${season}`
    )

    for (let i = from; i <= to; i++) {
      const matchesRound: MatchParsed = {
        league: league.name as League,
        round: i + 1,
        season,
        matches: []
      }

      await page.goto(
        `https://www.fotmob.com/leagues/${league.id}/fixtures/${league.acrom}?season=${season}&group=by-round&round=${i}`,
        { waitUntil: 'load' }
      )

      const matchLinks = await page.$$eval('.e1mcimok0', (links) => {
        return links.map((link) => link.getAttribute('href'))
      })

      for (const link of matchLinks) {
        const matchName = link.split('/').at(2).replaceAll('-', ' ')
        const response = page.waitForResponse(
          (res) =>
            res.url().includes('api/data/matchDetails') && res.status() === 200
        )
        await page.goto(`https://www.fotmob.com/${link}`)
        try {
          const matchResponse = await response
          const match = await scrapeMatchResult(matchResponse)
          matchesRound.matches.push(match)
          console.log(`${matchName} match scraped`)
        } catch (error) {
          console.log(`${matchName} Could not parse response as JSON`)
          // console.log(error)
        }
      }
      console.log(
        `Matches for ${matchesRound.league} season ${season} round ${matchesRound.round} scraped`
      )
      await writeData({
        data: matchesRound,
        dir: `matches/${league.acrom}/${season}`,
        fileName: `/${league.acrom}-week-${matchesRound.round}.json`
      })
    }
    await browser.close()
  }
}
