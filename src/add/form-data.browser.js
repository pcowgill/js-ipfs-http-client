'use strict'
/* eslint-env browser */

const normaliseInput = require('ipfs-utils/src/files/normalise-input')
const mtimeToObject = require('../lib/mtime-to-object')

exports.toFormData = async input => {
  console.log("toFormData browser");
  const files = normaliseInput(input)
  const formData = new FormData()
  let i = 0

  for await (const file of files) {
    const headers = {}
    console.log({ file })

    if (file.mtime !== undefined && file.mtime !== null) {
      console.log("file.mtime !== undefined && file.mtime !== null")
      const mtime = mtimeToObject(file.mtime)

      if (mtime) {
        headers.mtime = mtime.secs
        headers['mtime-nsecs'] = mtime.nsecs
      }
    }

    if (file.mode !== undefined && file.mode !== null) {
      console.log("file.mode !== undefined && file.mode !== null")
      headers.mode = file.mode.toString(8).padStart(4, '0')
    }

    if (file.content) {
      console.log("file.content")
      // In the browser there's _currently_ no streaming upload, buffer up our
      // async iterator chunks and append a big Blob :(
      // One day, this will be browser streams
      const bufs = []
      for await (const chunk of file.content) {
        bufs.push(chunk)
      }

      formData.append(`file-${i}`, new Blob(bufs, { type: 'application/octet-stream' }), encodeURIComponent(file.path), {
        header: headers
      })
    } else {
      formData.append(`dir-${i}`, new Blob([], { type: 'application/x-directory' }), encodeURIComponent(file.path), {
        header: headers
      })
    }
    console.log({ file })
    console.log({ formData })

    i++
  }

  const formDataParts = formData.getParts();
  console.log({ formDataParts })

  // for (var p of formData.entries()) {
  //   console.log({ p })
  // }

  return formData
}
