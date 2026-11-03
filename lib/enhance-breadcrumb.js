module.exports = (request, resource) => {
  const slug = resource.fields.slug.replace(/ /g, '-')
  request.app.locals.breadcrumb = request.app.locals.breadcrumb.map((b) =>
    b.label.replace(/ /g, '-') === slug ? { ...b, label: resource.fields.title } : b
  )
}
