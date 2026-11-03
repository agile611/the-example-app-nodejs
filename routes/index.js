const express = require('express')
const router = express.Router()
const { catchErrors } = require('../handlers/errorHandlers')

const { getLandingPage } = require('./landingPage')
const { getSettings, postSettings } = require('./settings')
const { getImprint } = require('./imprint')
const {
  getCourses,
  getCourse,
  getCoursesByCategory,
  getLesson
} = require('./courses')

router.all('*', async (request, response, next) => {
  if (response.locals.forceSettingsRoute) {
    await getSettings(request, response, next)
    return
  }
  next()
})

router.get('/', catchErrors(getLandingPage))
router.get('/courses', catchErrors(getCourses))
router.get('/courses/categories', catchErrors(getCourses))
router.get('/courses/categories/:category', catchErrors(getCoursesByCategory))
router.get('/courses/:slug', catchErrors(getCourse))
router.get('/courses/:slug/lessons', catchErrors(getCourse))
router.get('/courses/:cslug/lessons/:lslug', catchErrors(getLesson))
router.get('/settings', catchErrors(getSettings))
router.post('/settings', catchErrors(postSettings))
router.get('/imprint', catchErrors(getImprint))

module.exports = router
