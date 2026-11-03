const { translate } = require('../i18n/i18n')

module.exports.getImprint = (request, response) => {
  response.render('imprint', {
    title: translate('imprintLabel', response.locals.currentLocale.code)
  })
}
