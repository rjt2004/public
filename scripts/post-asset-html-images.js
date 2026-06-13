'use strict'

const path = require('path')

const getPostDirName = (data) => {
  const postDirName = path.basename(data.source, path.extname(data.source))
  return postDirName
}

const stripPostDirPrefix = (html, postDirName) => {
  if (!html || !postDirName) return html
  const escaped = postDirName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const prefix = escaped.replace(/\\/g, '[\\\\/]')
  const pattern = new RegExp(`(<img\\b[^>]*?\\b(?:src|data-src)=["'])${prefix}[\\\\/]([^"']+["'][^>]*>)`, 'g')

  return html.replace(pattern, '$1$2')
}

hexo.extend.filter.register('before_post_render', function (data) {
  if (!data.source || !data.raw) return data

  data.raw = stripPostDirPrefix(data.raw, getPostDirName(data))
  return data
})

hexo.extend.filter.register('after_post_render', function (data) {
  if (!data.source || !data.content) return data

  data.content = stripPostDirPrefix(data.content, getPostDirName(data))
  return data
})
