const marked = require('marked')
const { translate } = require('./i18n/i18n')

module.exports.markdown = (content = '') => {
  if (!content.trim()) return ''
  return marked(removeInvalidDataURL(content), { sanitize: true })
}

module.exports.dump = (obj) => JSON.stringify(obj, null, 2)

module.exports.formatMetaTitle = (title, localeCode = 'en-US') => {
  if (!title) return translate('defaultTitle', localeCode)
  return `${title.charAt(0).toUpperCase()}${title.slice(1)} — ${translate('defaultTitle', localeCode)}`
}

const IGNORED_QUERY_KEYS = ['space_id', 'delivery_token', 'preview_token', 'reset']

module.exports.cleanupQueryParameters = (query) => {
  const cleanQuery = { ...query }
  IGNORED_QUERY_KEYS.forEach((key) => delete cleanQuery[key])
  return cleanQuery
}

function isCustomCredentials (settings) {
  return (
    settings.spaceId !== process.env.CONTENTFUL_SPACE_ID ||
    settings.deliveryToken !== process.env.CONTENTFUL_DELIVERY_TOKEN ||
    settings.previewToken !== process.env.CONTENTFUL_PREVIEW_TOKEN
  )
}

module.exports.updateSettingsQuery = (request, response, settings) => {
  const cleanQuery = module.exports.cleanupQueryParameters(request.query)
  const settingsQuery = {
    ...cleanQuery,
    editorial_features: settings.editorialFeatures ? 'enabled' : 'disabled'
  }

  if (isCustomCredentials(settings)) {
    settingsQuery.space_id = settings.spaceId
    settingsQuery.delivery_token = settings.deliveryToken
    settingsQuery.preview_token = settings.previewToken
  }

  const settingsQs = new URLSearchParams(settingsQuery).toString()
  response.locals.queryStringSettings = settingsQs ? `?${settingsQs}` : ''
}

module.exports.isCustomCredentials = isCustomCredentials

function removeInvalidDataURL (content) {
  return content.replace(/data:\S+;base64\S*/gm, '#')
}
