const { translate, translationAvaliable } = require('../i18n/i18n')

module.exports = (modifier) => (request, response, next) => {
  const baseUrl = `${request.protocol}://${request.get('host')}`
  const components = request.url.split('/').filter(Boolean)
  const currentLocale = response.locals.currentLocale.code

  const breadcrumbs = [
    { label: translate('homeLabel', currentLocale), url: baseUrl }
  ]

  components.forEach((component, i, array) => {
    const path = array.slice(0, i + 1).join('/')
    let label = component.replace(/-/g, ' ')

    if (translationAvaliable(`${label}Label`, currentLocale)) {
      label = translate(`${label}Label`, currentLocale)
    }

    breadcrumbs.push({
      label,
      url: `${baseUrl}/${path}`,
      path
    })
  })

  if (modifier) {
    breadcrumbs.forEach((b, i) => { breadcrumbs[i] = modifier(b) })
  }

  request.app.locals.breadcrumb = breadcrumbs
  next()
}
