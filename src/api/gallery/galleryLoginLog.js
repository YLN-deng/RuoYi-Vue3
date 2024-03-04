import request from '@/utils/request'

// 查询登录日志列表
export function listGalleryLoginLog(query) {
  return request({
    url: '/gallery/galleryLoginLog/list',
    method: 'get',
    params: query
  })
}

// 查询登录日志详细
export function getGalleryLoginLog(logId) {
  return request({
    url: '/gallery/galleryLoginLog/' + logId,
    method: 'get'
  })
}

// 新增登录日志
export function addGalleryLoginLog(data) {
  return request({
    url: '/gallery/galleryLoginLog',
    method: 'post',
    data: data
  })
}

// 修改登录日志
export function updateGalleryLoginLog(data) {
  return request({
    url: '/gallery/galleryLoginLog',
    method: 'put',
    data: data
  })
}

// 删除登录日志
export function delGalleryLoginLog(logId) {
  return request({
    url: '/gallery/galleryLoginLog/' + logId,
    method: 'delete'
  })
}
