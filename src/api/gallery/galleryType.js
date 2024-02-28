import request from '@/utils/request'

// 查询分类管理列表
export function listGalleryType(query) {
  return request({
    url: '/gallery/galleryType/list',
    method: 'get',
    params: query
  })
}

// 查询分类管理详细
export function getGalleryType(typeId) {
  return request({
    url: '/gallery/galleryType/' + typeId,
    method: 'get'
  })
}

// 新增分类管理
export function addGalleryType(data) {
  return request({
    url: '/gallery/galleryType',
    method: 'post',
    data: data
  })
}

// 修改分类管理
export function updateGalleryType(data) {
  return request({
    url: '/gallery/galleryType',
    method: 'put',
    data: data
  })
}

// 删除分类管理
export function delGalleryType(typeId) {
  return request({
    url: '/gallery/galleryType/' + typeId,
    method: 'delete'
  })
}
