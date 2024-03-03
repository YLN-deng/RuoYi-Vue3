import request from '@/utils/request'

// 查询列表管理列表
export function listGalleryImage(query) {
  return request({
    url: '/gallery/galleryImage/list',
    method: 'get',
    params: query
  })
}

// 查询列表管理详细
export function getGalleryImage(fileId) {
  return request({
    url: '/gallery/galleryImage/' + fileId,
    method: 'get'
  })
}

// 新增列表管理
export function addGalleryImage(data) {
  return request({
    url: '/gallery/galleryImage',
    method: 'post',
    data: data
  })
}

// 修改列表管理
export function updateGalleryImage(data) {
  return request({
    url: '/gallery/galleryImage',
    method: 'put',
    data: data
  })
}

// 删除列表管理
export function delGalleryImage(fileId) {
  return request({
    url: '/gallery/galleryImage/' + fileId,
    method: 'delete'
  })
}

// 上传或修改图库列表信息
export function uploadImage(formData) {
  return request({
    url: '/gallery/galleryImage/uploadImage',
    method: 'post',
    data:formData
  })
}

