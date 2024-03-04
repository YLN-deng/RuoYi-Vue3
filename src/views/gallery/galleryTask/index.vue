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
      <el-form-item label="是否签到" prop="taskSignIn">
        <el-select v-model="queryParams.taskSignIn" placeholder="请选择是否签到" @change="handleQuery">
          <el-option :label="'已签到'" :value="1"></el-option>
          <el-option :label="'未签到'" :value="0"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="完成任务" prop="taskAward">
        <el-select v-model="queryParams.taskAward" placeholder="请选择是否完成任务" @change="handleQuery">
          <el-option :label="'已完成'" :value="1"></el-option>
          <el-option :label="'未完成'" :value="0"></el-option>
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
          v-hasPermi="['gallery:galleryTask:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['gallery:galleryTask:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['gallery:galleryTask:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['gallery:galleryTask:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="galleryTaskList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="任务编号" align="center" prop="taskId" />
      <el-table-column label="用户编号" align="center" prop="userId" />
      <el-table-column label="点赞次数" align="center" prop="taskLikeCount">
        <template #default="{ row }">
          <el-tag :type="row.taskLikeCount === 5 ? 'success' : '' ">
            {{ row.taskLikeCount === 5 ? '已完成' : row.taskLikeCount + "/5" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="是否签到" align="center" prop="taskSignIn">
        <template #default="{ row }">
          <el-tag :type="row.taskSignIn === 1 ? 'success' : 'danger'">
            {{ row.taskSignIn === 1 ? '已签到' : '未签到' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="是否完成任务" align="center" prop="taskAward">
        <template #default="{ row }">
          <el-tag :type="row.taskAward === 1 ? 'success' : 'danger'">
            {{ row.taskAward === 1 ? '已完成' : '未完成' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="任务时间" align="center" prop="taskDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.taskDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['gallery:galleryTask:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['gallery:galleryTask:remove']">删除</el-button>
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

    <!-- 添加或修改任务管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="galleryTaskRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户编号" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入用户编号" />
        </el-form-item>
        <el-form-item label="点赞次数" prop="taskLikeCount">
          <el-input v-model="form.taskLikeCount" placeholder="请输入记录点赞次数" />
        </el-form-item>
        <el-form-item label="是否签到" prop="taskSignIn">
          <el-radio-group v-model="form.taskSignIn">
            <el-radio :label="0">未签到</el-radio>
            <el-radio :label="1">已签到</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="任务完成" prop="taskAward">
          <el-radio-group v-model="form.taskAward">
            <el-radio :label="0">未完成</el-radio>
            <el-radio :label="1">已完成</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="任务时间" prop="taskDate">
          <el-date-picker clearable
            v-model="form.taskDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择任务时间">
          </el-date-picker>
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

<script setup name="GalleryTask">
import { listGalleryTask, getGalleryTask, delGalleryTask, addGalleryTask, updateGalleryTask } from "@/api/gallery/galleryTask";

const { proxy } = getCurrentInstance();

const galleryTaskList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userId: null,
    taskSignIn: null,
    taskAward: null,
  },
  rules: {
    userId: [
      { required: true, message: "用户编号不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询任务管理列表 */
function getList() {
  loading.value = true;
  listGalleryTask(queryParams.value).then(response => {
    galleryTaskList.value = response.rows;
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
    taskId: null,
    userId: null,
    taskLikeCount: null,
    taskSignIn: null,
    taskAward: null,
    taskDate: null
  };
  proxy.resetForm("galleryTaskRef");
}

const signInOptions = [
  { label: '是', value: '1' },
  { label: '否', value: '0' }
];

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.taskId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加任务管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _taskId = row.taskId || ids.value
  getGalleryTask(_taskId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改任务管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["galleryTaskRef"].validate(valid => {
    if (valid) {
      if (form.value.taskId != null) {
        updateGalleryTask(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addGalleryTask(form.value).then(response => {
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
  const _taskIds = row.taskId || ids.value;
  proxy.$modal.confirm('是否确认删除任务管理编号为"' + _taskIds + '"的数据项？').then(function() {
    return delGalleryTask(_taskIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('gallery/galleryTask/export', {
    ...queryParams.value
  }, `galleryTask_${new Date().getTime()}.xlsx`)
}

getList();
</script>
