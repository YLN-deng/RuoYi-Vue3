import request from '@/utils/request'

// 查询收藏管理列表
export function listGalleryCollectLike(query) {
  return request({
    url: '/gallery/galleryCollectLike/list',
    method: 'get',
    params: query
  })
}

// 查询收藏管理详细
export function getGalleryCollectLike(id) {
  return request({
    url: '/gallery/galleryCollectLike/' + id,
    method: 'get'
  })
}

// 新增收藏管理
export function addGalleryCollectLike(data) {
  return request({
    url: '/gallery/galleryCollectLike',
    method: 'post',
    data: data
  })
}

// 修改收藏管理
export function updateGalleryCollectLike(data) {
  return request({
    url: '/gallery/galleryCollectLike',
    method: 'put',
    data: data
  })
}

// 删除收藏管理
export function delGalleryCollectLike(id) {
  return request({
    url: '/gallery/galleryCollectLike/' + id,
    method: 'delete'
  })
}
