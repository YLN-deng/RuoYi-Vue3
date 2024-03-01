<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="用户编号" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="用户账号" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入用户账号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="反馈时间" style="width: 308px">
        <el-date-picker
          v-model="daterangeFbDate"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="反馈进度" prop="fbSchedule">
        <el-select v-model="queryParams.fbSchedule" placeholder="请选择反馈进度" @change="handleQuery">
          <el-option :label="'未解决'" :value="0"></el-option>
          <el-option :label="'处理中'" :value="1"></el-option>
          <el-option :label="'已解决'" :value="2"></el-option>
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
          v-hasPermi="['gallery:galleryFeedback:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['gallery:galleryFeedback:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['gallery:galleryFeedback:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['gallery:galleryFeedback:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="galleryFeedbackList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="反馈编号" align="center" prop="fbId" />
      <el-table-column label="用户编号" align="center" prop="userId" />
      <el-table-column label="用户账号" align="center" prop="userName" />
      <el-table-column label="反馈信息" align="center" prop="fbDesc">
        <template #default="{ row }">
          <div class="ellipsis-container">
            <el-tooltip class="item" effect="dark" placement="bottom" :content="row.fbDesc">
              <span class="ellipsis-text">{{ row.fbDesc }}</span>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="反馈图片" align="center" prop="fbImage">
        <template #default="{ row }">
          <!-- 自定义插槽 -->
          <span @click="onPreviewImage(row.fbImage)" class="look-fbImage">查看</span>
        </template>
      </el-table-column>
      <el-table-column label="反馈时间" align="center" prop="fbDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.fbDate, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="反馈进度" align="center" prop="fbSchedule" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['gallery:galleryFeedback:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['gallery:galleryFeedback:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-image-viewer
      v-if="showViewer"
      @close="closeViewer"
      :url-list="urlPreview" 
      close-on-press-escape
    />
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改反馈管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="galleryFeedbackRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户编号" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入用户编号" />
        </el-form-item>
        <el-form-item label="用户账号" prop="userName">
          <el-input v-model="form.userName" placeholder="请输入用户账号" />
        </el-form-item>
        <el-form-item label="反馈信息" prop="fbDesc">
          <el-input v-model="form.fbDesc" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="反馈图片" prop="fbImage">
          <el-input v-model="form.fbImage" placeholder="请输入反馈图片地址" />
        </el-form-item>
        <el-form-item label="反馈时间" prop="fbDate">
          <el-date-picker clearable
            v-model="form.fbDate"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择反馈时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="反馈进度" prop="fbSchedule">
          <el-radio-group v-model="form.fbSchedule">
            <el-radio :label="0">未解决</el-radio>
            <el-radio :label="1">处理中</el-radio>
            <el-radio :label="2">已解决</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="GalleryFeedback">
import { listGalleryFeedback, getGalleryFeedback, delGalleryFeedback, addGalleryFeedback, updateGalleryFeedback } from "@/api/gallery/galleryFeedback";

const { proxy } = getCurrentInstance();

const galleryFeedbackList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const daterangeFbDate = ref([]);
const imgHost = import.meta.env.VITE_APP_BASE_IMG
const showViewer= ref(false) // 显示查看器
const urlPreview = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userId: null,
    userName: null,
    fbDate: null,
    fbSchedule: null
  },
  rules: {
    userId: [
      { required: true, message: "用户编号不能为空", trigger: "blur" }
    ],
    userName: [
      { required: true, message: "用户账号不能为空", trigger: "blur" }
    ],
    fbDesc: [
      { required: true, message: "反馈信息不能为空", trigger: "blur" }
    ],
    fbDate: [
      { required: true, message: "反馈时间不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询反馈管理列表 */
function getList() {
  loading.value = true;
  queryParams.value.params = {};
  if (null != daterangeFbDate && '' != daterangeFbDate) {
    queryParams.value.params["beginFbDate"] = daterangeFbDate.value[0];
    queryParams.value.params["endFbDate"] = daterangeFbDate.value[1];
  }
  listGalleryFeedback(queryParams.value).then(response => {
    galleryFeedbackList.value = response.rows;
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
    fbId: null,
    userId: null,
    userName: null,
    fbDesc: null,
    fbImage: null,
    fbDate: null,
    fbSchedule: null
  };
  proxy.resetForm("galleryFeedbackRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  daterangeFbDate.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.fbId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加反馈管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _fbId = row.fbId || ids.value
  getGalleryFeedback(_fbId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改反馈管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["galleryFeedbackRef"].validate(valid => {
    if (valid) {
      if (form.value.fbId != null) {
        updateGalleryFeedback(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addGalleryFeedback(form.value).then(response => {
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
  const _fbIds = row.fbId || ids.value;
  proxy.$modal.confirm('是否确认删除反馈管理编号为"' + _fbIds + '"的数据项？').then(function() {
    return delGalleryFeedback(_fbIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('gallery/galleryFeedback/export', {
    ...queryParams.value
  }, `galleryFeedback_${new Date().getTime()}.xlsx`)
}

// 显示查看器
function onPreviewImage(url) {
  const src = imgHost + url;
  urlPreview.value = [src]; // 将新的 URL 添加到数组中
  showViewer.value = true
}

// 关闭查看器
function closeViewer() {
  showViewer.value = false
}

getList();
</script>

<style>
.el-table__cell {
   position: static !important; 
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

/* 可以添加图标样式 */
.look-fbImage{
  color:#409EFC;
  font-size: 16px; /* 可以根据需要调整图标大小 */
  cursor: pointer; /* 鼠标样式 */
}
</style>
