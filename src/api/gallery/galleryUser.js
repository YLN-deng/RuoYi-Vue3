import request from '@/utils/request'

// 查询用户管理列表
export function listGalleryUser(query) {
  return request({
    url: '/gallery/galleryUser/list',
    method: 'get',
    params: query
  })
}

// 查询用户管理详细
export function getGalleryUser(userId) {
  return request({
    url: '/gallery/galleryUser/' + userId,
    method: 'get'
  })
}

// 新增用户管理
export function addGalleryUser(data) {
  return request({
    url: '/gallery/galleryUser',
    method: 'post',
    data: data
  })
}

// 修改用户管理
export function updateGalleryUser(data) {
  return request({
    url: '/gallery/galleryUser',
    method: 'put',
    data: data
  })
}

// 删除用户管理
export function delGalleryUser(userId) {
  return request({
    url: '/gallery/galleryUser/' + userId,
    method: 'delete'
  })
}

// 获取用户名称，头像信息
export function getGalleryUserInfo(userId) {
  return request({
    url: '/gallery/galleryUser/userInfo/' + userId,
    method: 'get'
  })
}

// 修改图库用户头像信息
export function uploadAvatar(file) {
  return request({
    url: '/gallery/galleryUser/uploadAvatar',
    method: 'post',
    data:file
  })
}
