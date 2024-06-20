import asyncHandler from 'express-async-handler'

// TODO: paginition

// category: 0 (buy), 1 (sell), 2 (all)
export const launch = asyncHandler(
  async (
    browser,
    category = 2,
    amount,
    payment = 'all-payments',
    verified = false,
  ) => {
    const url = `https://p2p.binance.com/trade/${payment}/USDT?fiat=TRY`

    // vars
    let buyResult = []
    let sellResult = []

    const page = await browser.newPage()
    page.setDefaultNavigationTimeout(0)
    await page.goto(url)

    // choose the amount
    if (amount > 0) {
      chooseAmount(page, amount)
      await page.waitForNetworkIdle()
    }

    if (category === 0 || category === 2) {
      if (verified === true) {
        await chooseVerifiedMerchant(page)
        await page.waitForNetworkIdle()
      }

      // buy ads details [default page]
      buyResult = await parse(page)
    }

    if (category === 1 || category === 2) {
      // click to sell page
      chooseSellPage(page)
      await page.waitForNetworkIdle()

      if (verified) {
        await chooseVerifiedMerchant(page)
        await page.waitForNetworkIdle()
      }

      // sell ads details
      sellResult = await parse(page)
    }

    await page.close()

    return {
      buy: buyResult,
      sell: sellResult,
    }
  },
)

const chooseSellPage = asyncHandler(async (page) => {
  await page.$eval(
    'div[data-tutorial-id="trade_filter"] .bn-tab-list .bn-tab:nth-child(2)',
    (button) => button.click(),
  )
})

const chooseVerifiedMerchant = asyncHandler(async (page) => {
  await page.$$eval('.bn-bubble-content .bn-switch', (els) => els[0].click())
})

const chooseAmount = asyncHandler(async (page, amount) => {
  await page.focus('#C2Csearchamount_searchbox_amount')
  await page.keyboard.type(amount)
})

const evaluateName = asyncHandler(async (page, ad) => {
  const merchantName = await page.evaluate(
    (el) => el.querySelector('a').textContent,
    ad,
  )

  return merchantName
})
const evaluatePrice = asyncHandler(async (page, ad) => {
  const price = await page.evaluate(
    (el) => Number(el.querySelector('td:nth-child(2) .headline5').textContent),
    ad,
  )

  return price
})
const evaluateAmount = asyncHandler(async (page, ad) => {
  const amount = await page.evaluate((el) => {
    const amounts = el.querySelector('td:nth-child(3) .body3').textContent
    return Number(amounts.replaceAll(' USDT', '').replaceAll(',', ''))
  }, ad)

  return amount
})
const evaluatePayments = asyncHandler(async (page, ad) => {
  const paymentMethods = await page.evaluate((elemnts) => {
    const methods = Array.from(
      elemnts.querySelectorAll('td:nth-child(4) .PaymentMethodItem__text'),
    ).map((el) => el.textContent)

    return methods
  }, ad)

  return paymentMethods
})
const evaluateVerification = asyncHandler(async (page, ad) => {
  const verification = await page.evaluate((elements) => {
    const checking = elements.querySelectorAll(
      'td:nth-child(1) > div > div:nth-child(1) > div',
    ).length

    if (checking !== 1) return true
    else return false
  }, ad)

  return verification
})
const parse = asyncHandler(async (page) => {
  // vars
  let results = []

  // ads selector
  const adsDetails = await page.$$('.bn-web-table-tbody tr')

  // checking all ads
  for (const ad of adsDetails) {
    const name = await evaluateName(page, ad)
    const price = await evaluatePrice(page, ad)
    const amount = await evaluateAmount(page, ad)
    const paymentMethods = await evaluatePayments(page, ad)
    const verification = await evaluateVerification(page, ad)

    const resultObj = {
      name,
      price,
      amount,
      payments: paymentMethods,
      verified: verification,
    }

    results.push({
      ...resultObj,
    })
  }

  return results
})
