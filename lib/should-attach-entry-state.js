module.exports = (response) =>
  response.locals.settings.editorialFeatures && response.locals.currentApi.id === 'cpa'
