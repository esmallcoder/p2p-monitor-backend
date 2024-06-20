import express from 'express'
import binanceRouter from './routes/binance.js'
import cors from 'cors'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

// Init
const app = express()

// middlewares
app.use(express.json())
app.use(cors())
puppeteer.use(StealthPlugin())

const browser = await puppeteer.launch({ headless: true })

app.use((req, res, next) => {
  res.locals.browser = browser
  next()
})

// Routes
app.use('/', binanceRouter)

// Server start
const PORT = 8000
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
