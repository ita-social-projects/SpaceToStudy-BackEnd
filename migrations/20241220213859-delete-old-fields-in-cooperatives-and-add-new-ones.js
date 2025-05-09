function transformSection(section) {
  const transformedSection = {}

  if (section.title && section.description && section._id && section.activities && Array.isArray(section.activities)) {
    transformedSection.title = section.title
    transformedSection.description = section.description
    transformedSection._id = section._id
  } else return {}

  transformedSection.resources = section.activities.map((activity) => {
    const transformedResource = {}

    if (activity.resource?._id) {
      transformedResource.resource = activity.resource._id
    }

    if (activity.resourceType) transformedResource.resourceType = activity.resourceType
    if (activity.resource?.availability) {
      transformedResource.availability = {
        status: activity.resource.availability.status,
        date: activity.resource.availability.date
      }
    }

    transformedResource.completionStatus = activity.completionStatus || 'active'

    return transformedResource
  })
  return transformedSection
}

async function processSections(db, cooperation) {
  if (!cooperation.sections) {
    await db.collection('cooperation').updateOne({ _id: cooperation._id }, { $set: { sections: [] } })
  } else {
    const isStructureCorrect = cooperation.sections.every(
      (section) =>
        section.title &&
        typeof section.title === 'string' &&
        section.description &&
        typeof section.description === 'string' &&
        Array.isArray(section.resources)
    )

    if (!isStructureCorrect && cooperation.sections.length !== 0) {
      const transformedSections = cooperation.sections.map((section) => transformSection(section))
      const nonEmptySections = transformedSections.filter((section) => Object.keys(section).length > 0)

      await db.collection('cooperation').updateOne({ _id: cooperation._id }, { $set: { sections: nonEmptySections } })
    }
  }
}

module.exports = {
  async up(db) {
    await db
      .collection('cooperation')
      .aggregate([{ $match: {} }, { $out: 'cooperation_backup' }])
      .toArray()

    const allUserIds = new Set(
      (
        await db
          .collection('users')
          .find({}, { projection: { _id: 1 } })
          .toArray()
      ).map((user) => user._id.toString())
    )
    const allCooperations = await db.collection('cooperation').find({}).toArray()

    for (const cooperation of allCooperations) {
      if (!allUserIds.has(cooperation.receiver.toString()) || !allUserIds.has(cooperation.initiator.toString())) {
        await db.collection('cooperation').deleteOne({ _id: cooperation._id })
      }

      if (Array.isArray(cooperation.proficiencyLevel) && cooperation.proficiencyLevel.length > 0) {
        const averageProficiencyLevelIndex = cooperation.proficiencyLevel.length / 2
        const averageProficiencyLevel = cooperation.proficiencyLevel[Math.ceil(averageProficiencyLevelIndex)]
        await db
          .collection('cooperation')
          .updateOne({ _id: cooperation._id }, { $set: { proficiencyLevel: averageProficiencyLevel } })
      }

      if (!cooperation.title) {
        const initiatorId = cooperation.initiator.toString()
        const allInitiatorCooperations = allCooperations.filter((coop) => coop.initiator.toString() === initiatorId)
        const cooperationIndex = allInitiatorCooperations.findIndex(
          (coop) => coop._id.toString() === cooperation._id.toString()
        )
        const cooperationTitle = `Cooperation ${cooperationIndex + 1}`

        await db.collection('cooperation').updateOne({ _id: cooperation._id }, { $set: { title: cooperationTitle } })
      }
      await processSections(db, cooperation)
    }

    await db.collection('cooperation').updateMany(
      {
        $or: [{ category: { $exists: true } }, { subject: { $exists: true } }, { languages: { $exists: true } }]
      },
      {
        $unset: {
          category: '',
          subject: '',
          languages: ''
        }
      }
    )

    await db.collection('cooperation').updateMany(
      {
        description: { $exists: true }
      },
      {
        $rename: {
          description: 'additionalInfo'
        }
      }
    )
  },

  async down(db) {
    const backupExists = await db.listCollections({ name: 'cooperation_backup' }).hasNext()
    if (!backupExists) {
      throw new Error("Backup 'cooperation_backup' not found. Rollback is not possible.")
    }

    await db.collection('cooperation').drop()

    await db
      .collection('cooperation_backup')
      .aggregate([{ $match: {} }, { $out: 'cooperation' }])
      .toArray()

    await db.collection('cooperation_backup').drop()
  },
  transformSection
}
