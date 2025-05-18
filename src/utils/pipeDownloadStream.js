const pipeDownloadStream = (res, stream, fileName) => {
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`)
  res.setHeader('Content-Type', 'application/octet-stream')

  stream.on('error', (err) => {
    if (!res.headersSent) {
      res.status(500).json({ error: 'Stream failed' })
    } else {
      res.destroy(err)
    }
  })

  stream.pipe(res)
}

module.exports = pipeDownloadStream
