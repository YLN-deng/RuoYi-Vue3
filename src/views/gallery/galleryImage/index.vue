<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="上传用户" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入上传用户"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="图片分类" prop="fileType">
        <el-select v-model="queryParams.fileType" placeholder="请选择图片分类" @change="handleQuery">
          <el-option v-for="(item,index) in galleryTypeData" :label="item" :value="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="上传日期" style="width: 308px">
        <el-date-picker
          v-model="daterangeFileDate"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="图片审核" prop="fileReview">
        <el-select v-model="queryParams.fileReview" placeholder="请选择是否通过审核" @change="handleQuery">
          <el-option :label="'已审核'" :value="1"></el-option>
          <el-option :label="'未审核'" :value="0"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['gallery:galleryImage:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['gallery:galleryImage:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['gallery:galleryImage:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['gallery:galleryImage:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="galleryImageList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="图片编号" align="center" prop="fileId" />
      <el-table-column label="用户编号" align="center" prop="userId" />
      <el-table-column label="上传用户" align="center" prop="userName" />
      <el-table-column label="名称" align="center" prop="fileName" />
      <el-table-column label="分类" align="center" prop="fileType" />
      <el-table-column label="来源" align="center" prop="fileOrigin">
        <template #default="{ row }">
          <div class="ellipsis-container">
            <el-tooltip class="item" effect="dark" placement="bottom" :content="row.fileOrigin">
              <span class="ellipsis-text">{{ row.fileOrigin }}</span>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="点赞数" align="center" prop="fileLikeCount" />
      <el-table-column label="收藏数" align="center" prop="fileCollectCount" />
      <el-table-column label="下载次数" align="center" prop="fileDownCount" />
      <el-table-column label="上传日期" align="center" prop="fileDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.fileDate, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审核状态" align="center" prop="fileReview">
        <template #default="{ row }">
          <el-tag :type="row.fileReview === 1 ? 'success' : 'danger'">
            {{ row.fileReview === 1 ? '已通过' : '未通过' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="图片状态" align="center" prop="fileStatus">
        <template #default="{ row }">
          <el-tag :type="row.fileStatus === 0 ? 'success' : 'danger'">
            {{ row.fileStatus === 0 ? '显示' : '隐藏' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="是否删除" align="center" prop="fileDelete">
        <template #default="{ row }">
          <el-tag :type="row.fileDelete === 0 ? 'success' : 'danger'">
            {{ row.fileDelete === 0 ? '否' : '是' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['gallery:galleryImage:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['gallery:galleryImage:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改列表管理对话框 -->
    <el-dialog :title="title" v-model="open" :width="dialogWidth" append-to-body>
      <el-form v-if="title=='修改列表管理'" ref="galleryImageRef" :model="form" :rules="rules" label-width="80px">
        <div style="display: flex;">
          <div style="width: 400px;display: flex;flex-direction: column;justify-content: space-between">
            <!-- <el-image
              :src="imgHost + form.filePath"
              fit="cover"
              style="width: 300px;"
            /> -->
            <div v-loading="loadingImage" element-loading-text="载入中..." style="width:300px">
              <image-preview :src="imgHost + form.filePath" :width="300"/>
            </div>

            <div>
              <el-form-item label="审核状态" prop="fileReview">
                <el-radio-group v-model="form.fileReview">
                  <el-radio :label="1">已通过</el-radio>
                  <el-radio :label="0">未通过</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="图片状态" prop="fileStatus">
                <el-radio-group v-model="form.fileStatus">
                  <el-radio :label="0">显示</el-radio>
                  <el-radio :label="1">隐藏</el-radio>
                </el-radio-group>
              </el-form-item>
            </div>
          </div>
          <div style="width: 400px;">
            <el-form-item label="用户编号" prop="userId">
              <el-input v-model="form.userId" placeholder="请输入用户编号" @change="handleInput(form.userId)"/>
            </el-form-item>
            <el-form-item label="上传用户" prop="userName">
              <el-input v-model="form.userName" placeholder="请输入上传用户" />
            </el-form-item>
            <el-form-item label="用户头像" prop="userAvatar">
              <el-input v-model="form.userAvatar" placeholder="请输入上传者头像" />
            </el-form-item>
            <el-form-item label="图片名称" prop="fileName">
              <el-input v-model="form.fileName" placeholder="请输入图片名称" />
            </el-form-item>
            <el-form-item label="图片分类" prop="fileType">
              <el-select v-model="form.fileType" placeholder="请选择图片分类" style="width:100%" @change="handleSelect(form.fileType)">
                <el-option v-for="(item,index) in galleryTypeData" :label="item" :value="item"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="图片后缀" prop="fileSuffix">
              <el-input v-model="form.fileSuffix" placeholder="请输入图片后缀" />
            </el-form-item>
            <el-form-item label="图片地址" prop="filePath">
              <el-input v-model="form.filePath" placeholder="请输入图片地址" />
            </el-form-item>
            <el-form-item label="图片来源" prop="fileOrigin">
              <el-input v-model="form.fileOrigin" type="textarea" placeholder="请输入图片来源" />
            </el-form-item>
            <el-form-item label="图片宽度" prop="fileWidth">
              <el-input v-model="form.fileWidth" placeholder="请输入图片宽度" />
            </el-form-item>
            <el-form-item label="图片高度" prop="fileHeight">
              <el-input v-model="form.fileHeight" placeholder="请输入图片高度" />
            </el-form-item>
            <el-form-item label="图片大小" prop="fileSize">
              <el-input v-model="form.fileSize" placeholder="请输入图片大小" />
            </el-form-item>
            <el-form-item label="总点赞数" prop="fileLikeCount">
              <el-input v-model="form.fileLikeCount" placeholder="请输入图片总点赞数" />
            </el-form-item>
            <el-form-item label="总收藏数" prop="fileCollectCount">
              <el-input v-model="form.fileCollectCount" placeholder="请输入图片总收藏数" />
            </el-form-item>
            <el-form-item label="下载次数" prop="fileDownCount">
              <el-input v-model="form.fileDownCount" placeholder="请输入图片下载总次数" />
            </el-form-item>
            <el-form-item label="上传日期" prop="fileDate">
              <el-date-picker clearable
                v-model="form.fileDate"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择图片上传日期">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="是否删除" prop="fileDelete">
                <el-radio-group v-model="form.fileDelete">
                  <el-radio :label="0">否</el-radio>
                  <el-radio :label="1">是</el-radio>
                </el-radio-group>
              </el-form-item>
          </div>
        </div>
        
      </el-form>

      <!-- 新增 -->
      <el-form v-else ref="galleryImageRef" :model="form" :rules="rules" label-width="80px">
        <div style="display: flex;">
          <div style="width: 400px">
            <el-upload
              class="avatar-uploader"
              :headers="headers"
              :action="action"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :on-error="handleAvatarError"
              :before-upload="beforeAvatarUpload"
              :data="{fileType:uploadData}"
            >
             <div v-loading="loadingImage" element-loading-text="载入中..." v-if="imageUrl">
                <el-image
                  :src="imageUrl"
                  class="avatar"
                ></el-image> 
             </div>
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </div>
          <div style="width: 400px;">
            <el-form-item label="用户编号" prop="userId">
              <el-input v-model="form.userId" placeholder="请输入用户编号" @change="handleInput(form.userId)"/>
            </el-form-item>
            <el-form-item label="上传用户" prop="userName">
              <el-input v-model="form.userName" placeholder="请输入上传用户" />
            </el-form-item>
            <el-form-item label="用户头像" prop="userAvatar">
              <el-input v-model="form.userAvatar" placeholder="请输入上传者头像" />
            </el-form-item>
            <el-form-item label="图片分类" prop="fileType">
              <el-select v-model="form.fileType" placeholder="请选择图片分类" style="width:100%" @change="handleSelect(form.fileType)">
                <el-option v-for="(item,index) in galleryTypeData" :label="item" :value="item"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="图片名称" prop="fileName">
              <el-input v-model="form.fileName" placeholder="请输入图片名称" />
            </el-form-item>
            <el-form-item label="图片地址" prop="filePath">
              <el-input v-model="form.filePath" placeholder="请输入图片地址" />
            </el-form-item>
            <el-form-item label="图片来源" prop="fileOrigin">
              <el-input v-model="form.fileOrigin" type="textarea" placeholder="请输入图片来源" />
            </el-form-item>
            <el-form-item label="图片后缀" prop="fileSuffix">
              <el-input v-model="form.fileSuffix" placeholder="请输入图片后缀" />
            </el-form-item>
            <el-form-item label="图片宽度" prop="fileWidth">
              <el-input v-model="form.fileWidth" placeholder="请输入图片宽度" />
            </el-form-item>
            <el-form-item label="图片高度" prop="fileHeight"> 
              <el-input v-model="form.fileHeight" placeholder="请输入图片高度" />
            </el-form-item>
            <el-form-item label="图片大小" prop="fileSize">
              <el-input v-model="form.fileSize" placeholder="请输入图片大小" />
            </el-form-item>
            <el-form-item label="上传日期" prop="fileDate">
              <el-date-picker clearable
                v-model="form.fileDate"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择图片上传日期">
              </el-date-picker>
            </el-form-item>
          </div>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-upload
            v-if="title=='修改列表管理'"
            class="upload-demo"
            :headers="headers"
            :action="action"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :on-error="handleAvatarError"
            :before-upload="beforeAvatarUpload"
            :data="{fileType:uploadData}"
          >
            <el-button style="margin-right: 12px;" type="warning">修改图片</el-button>
          </el-upload>
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="GalleryImage">
import { listGalleryImage, getGalleryImage, delGalleryImage, addGalleryImage, updateGalleryImage } from "@/api/gallery/galleryImage";
import {getGalleryUserInfo} from "@/api/gallery/galleryUser";
import { listGalleryType} from "@/api/gallery/galleryType";
import { getToken } from '@/utils/auth'

const { proxy } = getCurrentInstance();

const galleryImageList = ref([]);
const dialogWidth = ref(0);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const daterangeFileDate = ref([]);
const imgHost = import.meta.env.VITE_APP_BASE_IMG
const action = import.meta.env.VITE_APP_BASE_HOST + "/gallery/galleryImage/uploadImage";
const headers = {
  'Authorization': 'Bearer ' + getToken()
}
const loadingImage = ref(false)
const imageUrl = ref(null);

  // 图片上传参数
const uploadData = ref("")

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userName: null,
    fileType: null,
    fileDate: null,
    fileReview: null,
  },
  rules: {
    userId: [
      { required: true, message: "用户编号不能为空", trigger: "blur" }
    ],
    fileType: [
      { required: true, message: "图片分类不能为空", trigger: "blur" }
    ],
    fileOrigin: [
      { required: true, message: "图片来源不能为空", trigger: "blur" }
    ],
    fileDate: [
      { required: true, message: "图片上传时间不能为空", trigger: "blur" }
    ],
  },
  // 查询listGalleryType的参数
  queryTypeParams: {
    pageNum: 1,
    pageSize: 10,
    createDate: null,
    updateDate: null
  },
  // 保存GalleryType参数
  galleryTypeData : [],
});

const { queryParams, form, rules, galleryTypeData, queryTypeParams } = toRefs(data);

/** 查询列表管理列表 */
function getList() {
  loading.value = true;
  queryParams.value.params = {};
  if (null != daterangeFileDate && '' != daterangeFileDate) {
    queryParams.value.params["beginFileDate"] = daterangeFileDate.value[0];
    queryParams.value.params["endFileDate"] = daterangeFileDate.value[1];
  }
  listGalleryImage(queryParams.value).then(response => {
    galleryImageList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    fileId: null,
    userId: null,
    userName: null,
    userAvatar: null,
    fileName: null,
    fileType: null,
    fileSuffix: null,
    filePath: null,
    fileOrigin: null,
    fileWidth: null,
    fileHeight: null,
    fileSize: null,
    fileLikeCount: null,
    fileCollectCount: null,
    fileDownCount: null,
    fileDate: null,
    fileShow: null,
    fileReview: null,
    fileStatus: null,
    fileDelete: null
  };
  proxy.resetForm("galleryImageRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  daterangeFileDate.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.fileId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  dialogWidth.value = "800px"
  imageUrl.value = null
  open.value = true;
  title.value = "添加列表管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _fileId = row.fileId || ids.value
  getGalleryImage(_fileId).then(response => {
    form.value = response.data;
    dialogWidth.value = "800px"
    open.value = true;
    title.value = "修改列表管理";
    uploadData.value = response.data.fileType;
  });
}


/** 提交按钮 */
function submitForm() {
  proxy.$refs["galleryImageRef"].validate(valid => {
    if (valid) {
      if (form.value.fileId != null) {
        updateGalleryImage(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addGalleryImage(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _fileIds = row.fileId || ids.value;
  proxy.$modal.confirm('是否确认删除列表管理编号为"' + _fileIds + '"的数据项？').then(function() {
    return delGalleryImage(_fileIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('gallery/galleryImage/export', {
    ...queryParams.value
  }, `galleryImage_${new Date().getTime()}.xlsx`)
}

/**
 * 
 * @param {*} rawFile 
 * 上传头像图片限制
 */
 const beforeAvatarUpload = (rawFile) => {
  // 上传限制
  if(form.value.userId == null || form.value.userId == "") {
    proxy.$modal.msgError("请输入用户编号！");
    return false;
  }else if(form.value.fileType == null || form.value.userId == "") {
    proxy.$modal.msgError("请输入图片分类！");
    return false;
  }else if (rawFile.type !== "image/jpeg") {
    proxy.$modal.msgError("图片必须是 JPG/PNG/GIF 格式！");
    return false;
  } else if (rawFile.size / 1024 / 1024 > 10) {
    proxy.$modal.msgError("图片大小不能超过10MB！");
    return false;
  }
  // 显示上传图片
  imageUrl.value = URL.createObjectURL(rawFile);

  // 开启上传动画
  loadingImage.value = true;
  return true
};

/**
 * 上传成功回显
 * @param {*} res 
 */
const handleAvatarSuccess = (res) => {
  const { width, height, suffix, fileSize, fileName, filePath } = res.data;
  // 回显表单图片宽度
  form.value.fileWidth = width;
  // 回显表单图片高度
  form.value.fileHeight = height;
  // 回显表单图片后缀
  form.value.fileSuffix = suffix;
  // 回显表单图片大小
  form.value.fileSize = fileSize;
  // 回显表单图片名字
  form.value.fileName = fileName;
  // 回显表单图片地址
  form.value.filePath = filePath;
  // 上传动画结束
  loadingImage.value = false;
}

/**
 * 上传失败处理
 * @param {*} err 
 */
const handleAvatarError = (err) => {
  // 上传动画结束
  loadingImage.value = false;
  proxy.$modal.msgError("上传失败");
}

/**
 * 输入时回显用户数据
 * @param {*} userId 
 */
function handleInput(userId) {
  getGalleryUserInfo(userId).then((res) => {
    const { userName, userAvatar } = res.data
    form.value.userName = userName;
    form.value.userAvatar = userAvatar;
  })
}

/**
 * 选择图片分类时，保存信息上传
 * @param {*} fileType 
 */
function handleSelect(fileType) {
  uploadData.value = fileType;
}

// 查询GalleryType表
async function getlistGalleryType() {
  await listGalleryType(queryTypeParams.value).then(response => {
    // 遍历 response.rows，并将每个 item.fileType 添加到 galleryTypeData 数组中
    galleryTypeData.value = response.rows.map(item => item.fileType);
  });
}

getList();
getlistGalleryType();
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 300px;
  height: 300px;
  text-align: center;
}

.example-showcase .el-loading-mask {
  z-index: 9;
}
</style>

<style scoped>
.ellipsis-container {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ellipsis-text {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.avatar-uploader .avatar {
  width: 300px;
  display: block;
}

.dialog-footer {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
}

</style>
