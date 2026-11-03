const { uniqWith, isEqual } = require('lodash')
const { createClient } = require('contentful')

const { isCustomCredentials, updateSettingsQuery } = require('../helpers')
const { updateCookie } = require('../lib/cookies')
const { translate } = require('../i18n/i18n')
const { initClients, getSpace } = require('../services/contentful')

const SETTINGS_NAME = 'theExampleAppSettings'

async function renderSettings (response, opts = {}) {
  let space = false
  try {
    space = await getSpace()
  } catch {
    // Handled within the settings page
  }

  response.render('settings', {
    title: translate('settingsLabel', response.locals.currentLocale.code),
    errors: {},
    hasErrors: false,
    success: false,
    space,
    ...opts
  })
}

async function generateErrorList (settings, currentLocale) {
  const { spaceId, deliveryToken, previewToken } = settings
  const errorList = []

  if (!spaceId) errorList.push({ field: 'spaceId', message: translate('fieldIsRequiredLabel', currentLocale.code) })
  if (!deliveryToken) errorList.push({ field: 'deliveryToken', message: translate('fieldIsRequiredLabel', currentLocale.code) })
  if (!previewToken) errorList.push({ field: 'previewToken', message: translate('fieldIsRequiredLabel', currentLocale.code) })

  const validateClient = async (accessToken, host, field, invalidMessage) => {
    try {
      await createClient({ space: spaceId, accessToken, host }).getSpace()
    } catch (err) {
      if (err.response?.status === 401) {
        errorList.push({ field, message: translate(invalidMessage, currentLocale.code) })
      } else if (err.response?.status === 404) {
        errorList.push({ field: 'spaceId', message: translate('spaceOrTokenInvalid', currentLocale.code) })
      } else {
        errorList.push({ field, message: `${translate('somethingWentWrongLabel', currentLocale.code)}: ${err.response?.data?.message}` })
      }
    }
  }

  if (spaceId && deliveryToken) {
    await validateClient(deliveryToken, process.env.CONTENTFUL_DELIVERY_API_HOST, 'deliveryToken', 'deliveryKeyInvalidLabel')
  }
  if (spaceId && previewToken) {
    await validateClient(previewToken, process.env.CONTENTFUL_PREVIEW_API_HOST, 'previewToken', 'previewKeyInvalidLabel')
  }

  return uniqWith(errorList, isEqual)
}

function generateErrorDictionary (errorList) {
  return errorList.reduce((errors, error) => ({
    ...errors,
    [error.field]: [...(errors[error.field] || []), error.message]
  }), {})
}

function applyUpdatedSettings (request, response, settings) {
  updateCookie(response, SETTINGS_NAME, settings)
  response.locals.settings = settings
  updateSettingsQuery(request, response, settings)
  initClients(settings)
}

module.exports.getSettings = async (request, response) => {
  const currentLocale = response.locals.currentLocale
  const { settings } = response.locals

  const errorList = await generateErrorList(settings, currentLocale)

  if (!errorList.length) {
    applyUpdatedSettings(request, response, settings)
  }

  const errors = generateErrorDictionary(errorList)

  await renderSettings(response, {
    settings,
    errors,
    hasErrors: errorList.length > 0,
    success: isCustomCredentials(settings) && errorList.length === 0
  })
}

module.exports.postSettings = async (request, response) => {
  const currentLocale = response.locals.currentLocale
  let { spaceId, deliveryToken, previewToken, editorialFeatures } = request.body

  if (request.query.reset) {
    spaceId = process.env.CONTENTFUL_SPACE_ID
    deliveryToken = process.env.CONTENTFUL_DELIVERY_TOKEN
    previewToken = process.env.CONTENTFUL_PREVIEW_TOKEN
  }

  const settings = {
    spaceId,
    deliveryToken,
    previewToken,
    editorialFeatures: !!editorialFeatures
  }

  const errorList = await generateErrorList(settings, currentLocale)

  if (!errorList.length) {
    applyUpdatedSettings(request, response, settings)
  }

  const errors = generateErrorDictionary(errorList)

  await renderSettings(response, {
    settings,
    errors,
    hasErrors: errorList.length > 0,
    success: errorList.length === 0
  })
}
