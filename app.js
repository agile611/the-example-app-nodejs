const path = require('path')

const cookieParser = require('cookie-parser')
const express = require('express')
const logger = require('morgan')
const helmet = require('helmet')

require('dotenv').config({ path: 'variables.env' })

const helpers = require('./helpers')
const { translate, initializeTranslations, setFallbackLocale } = require('./i18n/i18n')
const breadcrumb = require('./lib/breadcrumb')
const { updateCookie } = require('./lib/cookies')
const settings = require('./lib/settings')
const routes = require('./routes/index')
const { getSpace, getLocales } = require('./services/contentful')
const { catchErrors } = require('./handlers/errorHandlers')

const SETTINGS_NAME = 'theExampleAppSettings'

const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// Force HTTPS on production
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV === 'production') {
    res.redirect(302, `https://${req.hostname}${req.originalUrl}`)
  }
  next()
})

app.use(settings)

// Make data available for views
app.use(catchErrors(async (req, res, next) => {
  res.locals.baseUrl = `${req.protocol}://${req.headers.host}`
  res.locals.locales = [{ code: 'en-US', name: 'U.S. English' }]
  res.locals.currentLocale = res.locals.locales[0]
  res.locals.helpers = helpers

  const cleanQuery = helpers.cleanupQueryParameters(req.query)
  const qs = new URLSearchParams(cleanQuery).toString()

  res.locals.queryString = qs ? `?${qs}` : ''
  res.locals.queryStringSettings = res.locals.queryString
  res.locals.query = req.query
  res.locals.currentPath = req.path

  initializeTranslations()
  res.locals.translate = translate

  const apis = [
    { id: 'cda', label: translate('contentDeliveryApiLabel', res.locals.currentLocale.code) },
    { id: 'cpa', label: translate('contentPreviewApiLabel', res.locals.currentLocale.code) }
  ]

  res.locals.currentApi = apis.find((api) => api.id === (req.query.api || 'cda'))
    || apis.find((api) => api.id === 'cda')

  next()
}))

// Test space connection and attach locale data
app.use(catchErrors(async (req, res, next) => {
  try {
    const space = await getSpace()
    const locales = await getLocales()
    updateCookie(res, SETTINGS_NAME, res.locals.settings)

    res.locals.locales = locales
    const defaultLocale = res.locals.locales.find((locale) => locale.default)

    if (req.query.locale) {
      res.locals.currentLocale = space.locales.find((locale) => locale.code === req.query.locale)
    }

    if (!res.locals.currentLocale) {
      res.locals.currentLocale = defaultLocale
    }

    if (res.locals.currentLocale.fallbackCode) {
      setFallbackLocale(res.locals.currentLocale.fallbackCode)
    }

    helpers.updateSettingsQuery(req, res, res.locals.settings)
  } catch (error) {
    if ([401, 404].includes(error.response?.status)) {
      res.locals.forceSettingsRoute = true
    } else {
      throw error
    }
  }
  next()
}))

app.use(breadcrumb())
app.use('/', routes)

// 404
app.use((req, res, next) => {
  const err = new Error(translate('errorMessage404Route', res.locals.currentLocale.code))
  err.status = 404
  next(err)
})

// Error handler
/* eslint-disable-next-line no-unused-vars */
  app.use((err, req, res, next) => {
  res.locals.error = err
  res.locals.error.status = err.status || 500
  if (req.app.get('env') !== 'development') {
    delete err.stack
  }
  res.locals.title = 'Error'
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
