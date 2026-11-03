const { getLandingPage } = require('../services/contentful')
const attachEntryState = require('../lib/entry-state')
const shouldAttachEntryState = require('../lib/should-attach-entry-state')

module.exports.getLandingPage = async (request, response) => {
  const pathname = request.url.split('/').filter(Boolean)[0] || 'home'
  const locale = response.locals.currentLocale.code
  const api = response.locals.currentApi.id

  let landingPage = await getLandingPage(pathname, locale, api)

  if (shouldAttachEntryState(response)) {
    landingPage = await attachEntryState(landingPage)
  }

  response.render('landingPage', { title: pathname, landingPage })
}
