const {
  getCourses,
  getCourse,
  getCategories,
  getCoursesByCategory
} = require('./../services/contentful')

const attachEntryState = require('../lib/entry-state')
const enhanceBreadcrumb = require('../lib/enhance-breadcrumb')
const shouldAttachEntryState = require('../lib/should-attach-entry-state')
const { updateCookie } = require('../lib/cookies')
const { translate } = require('../i18n/i18n')

module.exports.getCourses = async (request, response) => {
  const locale = response.locals.currentLocale.code
  const api = response.locals.currentApi.id

  const [courses, categories] = await Promise.all([
    getCourses(locale, api),
    getCategories(locale, api)
  ])

  let enrichedCourses = courses
  if (shouldAttachEntryState(response)) {
    enrichedCourses = await Promise.all(courses.map(attachEntryState))
  }

  response.render('courses', {
    title: `${translate('allCoursesLabel', locale)} (${enrichedCourses.length})`,
    categories,
    courses: enrichedCourses
  })
}

module.exports.getCoursesByCategory = async (request, response) => {
  const locale = response.locals.currentLocale.code
  const api = response.locals.currentApi.id

  const categories = await getCategories(locale, api)
  const activeCategory = categories.find((c) => c.fields.slug === request.params.category)

  if (!activeCategory) {
    const error = new Error(translate('errorMessage404Category', response.currentLocale))
    error.status = 404
    throw error
  }

  let courses = await getCoursesByCategory(activeCategory.sys.id, locale, api)
  if (shouldAttachEntryState(response)) {
    courses = await Promise.all(courses.map(attachEntryState))
  }

  enhanceBreadcrumb(request, activeCategory)

  response.render('courses', {
    title: `${activeCategory.fields.title} (${courses.length})`,
    categories,
    courses
  })
}

module.exports.getCourse = async (request, response) => {
  const { slug } = request.params
  const locale = response.locals.currentLocale.code
  const api = response.locals.currentApi.id

  let course
  try {
    course = await getCourse(slug, locale, api)
  } catch (err) {
    if (err.status === 404) {
      err.message = translate('errorMessage404Course', response.currentLocale)
    }
    throw err
  }

  const lessons = course.fields.lessons || []
  const { lessonIndex, nextLesson } = getNextLesson(lessons, request.params.lslug)
  let lessonItem = lessons[lessonIndex]

  const cookie = request.cookies.visitedLessons || []
  const visitedLessons = [...new Set([...cookie, course.sys.id])]
  updateCookie(response, 'visitedLessons', visitedLessons)

  if (shouldAttachEntryState(response)) {
    course = await attachEntryState(course)
  }

  enhanceBreadcrumb(request, course)

  response.render('course', {
    title: course.fields.title,
    course,
    lesson: lessonItem,
    lessons,
    lessonIndex,
    nextLesson,
    visitedLessons
  })
}

module.exports.getLesson = async (request, response) => {
  const { cslug, lslug } = request.params
  const locale = response.locals.currentLocale.code
  const api = response.locals.currentApi.id

  const course = await getCourse(cslug, locale, api)
  const lessons = course.fields.lessons || []
  const { lessonIndex, nextLesson } = getNextLesson(lessons, lslug)
  let lessonItem = lessons[lessonIndex]

  if (!lessonItem) {
    const error = new Error(translate('errorMessage404Lesson', response.currentLocale))
    error.status = 404
    throw error
  }

  const cookie = request.cookies.visitedLessons || []
  const visitedLessons = [...new Set([...cookie, lessonItem.sys.id])]
  updateCookie(response, 'visitedLessons', visitedLessons)

  if (shouldAttachEntryState(response)) {
    lessonItem = await attachEntryState(lessonItem)
  }

  enhanceBreadcrumb(request, course)
  enhanceBreadcrumb(request, lessonItem)

  response.render('course', {
    title: `${course.fields.title} | ${lessonItem.fields.title}`,
    course,
    lesson: lessonItem,
    lessons,
    lessonIndex,
    nextLesson,
    visitedLessons
  })
}

function getNextLesson (lessons, lslug) {
  const lessonIndex = lessons.findIndex((lesson) => lesson.fields.slug === lslug)
  const lesson = lessons[lessonIndex]
  const nextLesson = lessons[lessonIndex + 1] || null

  return { lesson, lessonIndex, nextLesson }
}
