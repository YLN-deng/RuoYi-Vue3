<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="日志编号" prop="logId">
        <el-input
          v-model="queryParams.logId"
          placeholder="请输入日志编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="用户名称" prop="userAccount">
        <el-input
          v-model="queryParams.userAccount"
          placeholder="请输入登录用户名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="登录时间" style="width: 308px">
        <el-date-picker
          v-model="daterangeLogDate"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
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
          v-hasPermi="['gallery:galleryLoginLog:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['gallery:galleryLoginLog:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['gallery:galleryLoginLog:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['gallery:galleryLoginLog:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="galleryLoginLogList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="日志编号" align="center" prop="logId" />
      <el-table-column label="用户名称" align="center" prop="userAccount" />
      <el-table-column label="登录IP" align="center" prop="logIp" />
      <el-table-column label="登录城市" align="center" prop="logCity" />
      <el-table-column label="登录省份" align="center" prop="logRegionname" />
      <el-table-column label="登录国家" align="center" prop="logCountry" />
      <el-table-column label="操作系统" align="center" prop="logOs" />
      <el-table-column label="登录设备" align="center" prop="logBroswer" />
      <el-table-column label="登录时间" align="center" prop="logDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.logDate, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['gallery:galleryLoginLog:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['gallery:galleryLoginLog:remove']">删除</el-button>
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

    <!-- 添加或修改登录日志对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="galleryLoginLogRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名称" prop="userAccount">
          <el-input v-model="form.userAccount" placeholder="请输入登录用户名称" />
        </el-form-item>
        <el-form-item label="登录IP" prop="logIp">
          <el-input v-model="form.logIp" placeholder="请输入登录Ip地址" />
        </el-form-item>
        <el-form-item label="登录城市" prop="logCity">
          <el-input v-model="form.logCity" placeholder="请输入登录城市" />
        </el-form-item>
        <el-form-item label="登录省份" prop="logRegionname">
          <el-input v-model="form.logRegionname" placeholder="请输入登录省份" />
        </el-form-item>
        <el-form-item label="登录国家" prop="logCountry">
          <el-input v-model="form.logCountry" placeholder="请输入登录国家" />
        </el-form-item>
        <el-form-item label="操作系统" prop="logOs">
          <el-input v-model="form.logOs" placeholder="请输入登录设备操作系统" />
        </el-form-item>
        <el-form-item label="登录设备" prop="logBroswer">
          <el-input v-model="form.logBroswer" placeholder="请输入登录设备" />
        </el-form-item>
        <el-form-item label="登录时间" prop="logDate">
          <el-date-picker clearable
            v-model="form.logDate"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择修改时间">
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

<script setup name="GalleryLoginLog">
import { listGalleryLoginLog, getGalleryLoginLog, delGalleryLoginLog, addGalleryLoginLog, updateGalleryLoginLog } from "@/api/gallery/galleryLoginLog";

const { proxy } = getCurrentInstance();

const galleryLoginLogList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const daterangeLogDate = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    logId: null,
    userAccount: null,
    logDate: null
  },
  rules: {
    userAccount: [
      { required: true, message: "登录用户名称不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询登录日志列表 */
function getList() {
  loading.value = true;
  queryParams.value.params = {};
  if (null != daterangeLogDate && '' != daterangeLogDate) {
    queryParams.value.params["beginLogDate"] = daterangeLogDate.value[0];
    queryParams.value.params["endLogDate"] = daterangeLogDate.value[1];
  }
  listGalleryLoginLog(queryParams.value).then(response => {
    galleryLoginLogList.value = response.rows;
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
    logId: null,
    userAccount: null,
    logIp: null,
    logCity: null,
    logRegionname: null,
    logCountry: null,
    logOs: null,
    logBroswer: null,
    logDate: null
  };
  proxy.resetForm("galleryLoginLogRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  daterangeLogDate.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.logId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加登录日志";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _logId = row.logId || ids.value
  getGalleryLoginLog(_logId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改登录日志";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["galleryLoginLogRef"].validate(valid => {
    if (valid) {
      if (form.value.logId != null) {
        updateGalleryLoginLog(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addGalleryLoginLog(form.value).then(response => {
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
  const _logIds = row.logId || ids.value;
  proxy.$modal.confirm('是否确认删除登录日志编号为"' + _logIds + '"的数据项？').then(function() {
    return delGalleryLoginLog(_logIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('gallery/galleryLoginLog/export', {
    ...queryParams.value
  }, `galleryLoginLog_${new Date().getTime()}.xlsx`)
}

getList();
</script>
