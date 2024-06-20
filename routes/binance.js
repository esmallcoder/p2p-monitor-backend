import express from 'express'
import { launch } from '../controllers/binance.js'
import asyncHandler from 'express-async-handler'

const router = express.Router()

const closeBrowser = (req, res, next) => {
  // close browser
  res.locals.browser.close()
}

const sellHandler = asyncHandler(async (req, res, next) => {
  const { browser } = res.locals
  const { amount, paymentMethod, verified } = req.query
  const binanceLaunch = await launch(
    browser,
    1,
    amount,
    paymentMethod,
    verified == 'true' ? true : false,
  )

  res.status(200).json(binanceLaunch['sell'])
})

const buyHandler = asyncHandler(async (req, res) => {
  const { browser } = res.locals
  const { amount, paymentMethod, verified } = req.query
  const binanceLaunch = await launch(
    browser,
    0,
    amount,
    paymentMethod,
    verified == 'true' ? true : false,
  )

  res.status(200).json(binanceLaunch['buy'])
})

const allHandler = asyncHandler(async (req, res) => {
  const { browser } = res.locals
  const binanceLaunch = await launch(browser, 2, 0)

  res.status(200).json(binanceLaunch)
})

// ##### SELL #####
router.get('/api/binance/sell', sellHandler)

// ##### BUY #####
router.get('/api/binance/buy', buyHandler)

// ##### ALL #####
router.get('/api/binance/all', allHandler)

export default router
