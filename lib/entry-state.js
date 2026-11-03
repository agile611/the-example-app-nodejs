const { getEntry } = require('./../services/contentful')
const { isObject, isArray } = require('lodash')

async function getPublishedEntry (entry) {
  try {
    return await getEntry(entry.sys.id, entry.sys.contentType.sys.id)
  } catch {
    return null
  }
}

function isLinkDraft (previewLink, deliveryLink) {
  return Boolean(previewLink && !deliveryLink)
}

function isLinkPendingChanges (previewLink, deliveryLink) {
  if (!previewLink || !deliveryLink) return false
  return new Date(previewLink.sys.updatedAt).setMilliseconds(0)
    !== new Date(deliveryLink.sys.updatedAt).setMilliseconds(0)
}

function setEntryState (entry, originalItem, publishedItem) {
  if (isLinkDraft(originalItem, publishedItem)) entry.draft = true
  if (isLinkPendingChanges(originalItem, publishedItem)) entry.pendingChanges = true
  return entry
}

module.exports = async function attachEntryState (entry) {
  entry.draft = false
  entry.pendingChanges = false

  const publishedEntry = await getPublishedEntry(entry)
  if (!publishedEntry) {
    entry.draft = true
    return entry
  }

  const linkFields = Object.values(entry.fields).filter(isObject)

  linkFields.forEach((field) => {
    const publishedField = publishedEntry.fields[Object.keys(entry.fields)
      .find((k) => entry.fields[k] === field)]

    if (isArray(field)) {
      field.forEach((item, index) => {
        if (!isArray(item)) {
          setEntryState(entry, item, publishedField?.[index])
        }
      })
    } else {
      setEntryState(entry, field, publishedField)
    }
  })

  setEntryState(entry, entry, publishedEntry)
  return entry
}
