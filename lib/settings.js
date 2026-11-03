const { initClients } = require('../services/contentful')

module.exports = async function settingsMiddleware (request, response, next) {
  const settings = {
    spaceId: process.env.CONTENTFUL_SPACE_ID,
    deliveryToken: process.env.CONTENTFUL_DELIVERY_TOKEN,
    previewToken: process.env.CONTENTFUL_PREVIEW_TOKEN,
    editorialFeatures: false,
    ...request.cookies.theExampleAppSettings
  }

  const { space_id, preview_token, delivery_token } = request.query
  if (space_id && preview_token && delivery_token) {
    settings.spaceId = space_id
    settings.deliveryToken = delivery_token
    settings.previewToken = preview_token
  }

  const { editorial_features } = request.query
  if (editorial_features !== undefined) {
    delete request.query.editorial_features
    settings.editorialFeatures = editorial_features === 'enabled'
  }

  initClients(settings)
  response.locals.settings = settings
  next()
}
