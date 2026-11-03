const { createClient } = require('contentful')
const { version } = require('../package.json')

const applicationName = `the-example-app.nodejs/${version}`

let deliveryClient = null
let previewClient = null

module.exports.initClients = (options) => {
  const config = options || {
    spaceId: process.env.CONTENTFUL_SPACE_ID,
    deliveryToken: process.env.CONTENTFUL_DELIVERY_TOKEN,
    previewToken: process.env.CONTENTFUL_PREVIEW_TOKEN
  }

  deliveryClient = createClient({
    application: applicationName,
    space: config.spaceId,
    accessToken: config.deliveryToken,
    host: process.env.CONTENTFUL_DELIVERY_API_HOST,
    removeUnresolved: true
  })
  previewClient = createClient({
    application: applicationName,
    space: config.spaceId,
    accessToken: config.previewToken,
    host: process.env.CONTENTFUL_PREVIEW_API_HOST,
    removeUnresolved: true
  })
}

const getClient = (api = 'cda') => (api === 'cda' ? deliveryClient : previewClient)

const throwOnEmptyResult = (context, fn) => async (...params) => {
  const data = await fn(...params)
  if (!data) {
    const err = new Error(`${context} Not Found`)
    err.status = 404
    throw err
  }
  return data
}

module.exports.getSpace = throwOnEmptyResult('Space', (api = 'cda') => getClient(api).getSpace())

module.exports.getLocales = throwOnEmptyResult('Environment', async (api = 'cda') => {
  const response = await getClient(api).getLocales()
  return response.items
})

module.exports.getEntry = throwOnEmptyResult('Entry', (entryId, contentType, api = 'cda') =>
  getClient(api).getEntries({ content_type: contentType, 'sys.id': entryId })
    .then((response) => response.items[0])
)

module.exports.getCourses = throwOnEmptyResult('Course', (locale = 'en-US', api = 'cda') =>
  getClient(api).getEntries({
    content_type: 'course',
    locale,
    order: '-sys.createdAt',
    include: 1
  }).then((response) => response.items)
)

module.exports.getLandingPage = (slug, locale = 'en-US', api = 'cda') =>
  getClient(api).getEntries({
    content_type: 'layout',
    locale,
    'fields.slug': slug,
    include: 3
  }).then((response) => response.items[0])

module.exports.getCourse = throwOnEmptyResult('Course', (slug, locale = 'en-US', api = 'cda') =>
  getClient(api).getEntries({
    content_type: 'course',
    'fields.slug': slug,
    locale,
    include: 2
  }).then((response) => response.items[0])
)

module.exports.getCategories = throwOnEmptyResult('Course', (locale = 'en-US', api = 'cda') =>
  getClient(api).getEntries({ content_type: 'category', locale })
    .then((response) => response.items)
)

module.exports.getCoursesByCategory = throwOnEmptyResult('Category', (category, locale = 'en-US', api = 'cda') =>
  getClient(api).getEntries({
    content_type: 'course',
    'fields.categories.sys.id': category,
    locale,
    order: '-sys.createdAt',
    include: 1
  }).then((response) => response.items)
)
