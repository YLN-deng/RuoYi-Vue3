import request from '@/utils/request'

// 查询任务管理列表
export function listGalleryTask(query) {
  return request({
    url: '/gallery/galleryTask/list',
    method: 'get',
    params: query
  })
}

// 查询任务管理详细
export function getGalleryTask(taskId) {
  return request({
    url: '/gallery/galleryTask/' + taskId,
    method: 'get'
  })
}

// 新增任务管理
export function addGalleryTask(data) {
  return request({
    url: '/gallery/galleryTask',
    method: 'post',
    data: data
  })
}

// 修改任务管理
export function updateGalleryTask(data) {
  return request({
    url: '/gallery/galleryTask',
    method: 'put',
    data: data
  })
}

// 删除任务管理
export function delGalleryTask(taskId) {
  return request({
    url: '/gallery/galleryTask/' + taskId,
    method: 'delete'
  })
}
