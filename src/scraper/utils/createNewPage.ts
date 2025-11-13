import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })

export async function newPage() {
  const page = await browser.newPage()
  await page.route('**/*', (route) => {
    const blockTypes: string[] = ['font', 'media']
    if (blockTypes.includes(route.request().resourceType())) {
      route.abort()
    } else {
      route.continue()
    }
  })
  return { page, browser }
}
