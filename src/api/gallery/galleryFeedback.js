import request from '@/utils/request'

// 查询反馈管理列表
export function listGalleryFeedback(query) {
  return request({
    url: '/gallery/galleryFeedback/list',
    method: 'get',
    params: query
  })
}

// 查询反馈管理详细
export function getGalleryFeedback(fbId) {
  return request({
    url: '/gallery/galleryFeedback/' + fbId,
    method: 'get'
  })
}

// 新增反馈管理
export function addGalleryFeedback(data) {
  return request({
    url: '/gallery/galleryFeedback',
    method: 'post',
    data: data
  })
}

// 修改反馈管理
export function updateGalleryFeedback(data) {
  return request({
    url: '/gallery/galleryFeedback',
    method: 'put',
    data: data
  })
}

// 删除反馈管理
export function delGalleryFeedback(fbId) {
  return request({
    url: '/gallery/galleryFeedback/' + fbId,
    method: 'delete'
  })
}
