<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="创建时间" style="width: 308px">
        <el-date-picker
          v-model="daterangeCreateDate"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="修改时间" style="width: 308px">
        <el-date-picker
          v-model="daterangeUpdateDate"
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
          v-hasPermi="['gallery:galleryType:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['gallery:galleryType:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['gallery:galleryType:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['gallery:galleryType:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="galleryTypeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="id" align="center" prop="typeId" />
      <el-table-column label="文件分类" align="center" prop="fileType" />
      <el-table-column label="创建时间" align="center" prop="createDate">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createDate, '{y}-{m}-{d} {h}:{m}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改时间" align="center" prop="updateDate">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateDate, '{y}-{m}-{d} {h}:{m}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['gallery:galleryType:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['gallery:galleryType:remove']">删除</el-button>
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

    <!-- 添加或修改分类管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="galleryTypeRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="文件分类" prop="fileType">
          <el-input v-model="form.fileType" placeholder="请输入文件分类" />
        </el-form-item>
        <el-form-item  v-if="title=='添加分类管理'" label="创建时间" prop="createDate">
          <el-date-picker clearable
            v-model="form.createDate"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择创建时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item v-if="title=='修改分类管理'" label="修改时间" prop="updateDate">
          <el-date-picker clearable
            v-model="form.updateDate"
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

<script setup name="GalleryType">
import { listGalleryType, getGalleryType, delGalleryType, addGalleryType, updateGalleryType } from "@/api/gallery/galleryType";

const { proxy } = getCurrentInstance();

const galleryTypeList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const daterangeCreateDate = ref([]);
const daterangeUpdateDate = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    createDate: null,
    updateDate: null
  },
  rules: {
    fileType: [
      { required: true, message: "文件分类不能为空", trigger: "blur" }
    ],
    createDate: [
      { required: true, message: "创建时间不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询分类管理列表 */
function getList() {
  loading.value = true;
  queryParams.value.params = {};
  if (null != daterangeCreateDate && '' != daterangeCreateDate) {
    queryParams.value.params["beginCreateDate"] = daterangeCreateDate.value[0];
    queryParams.value.params["endCreateDate"] = daterangeCreateDate.value[1];
  }
  if (null != daterangeUpdateDate && '' != daterangeUpdateDate) {
    queryParams.value.params["beginUpdateDate"] = daterangeUpdateDate.value[0];
    queryParams.value.params["endUpdateDate"] = daterangeUpdateDate.value[1];
  }
  listGalleryType(queryParams.value).then(response => {
    galleryTypeList.value = response.rows;
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
    typeId: null,
    fileType: null,
    createDate: null,
    updateDate: null
  };
  proxy.resetForm("galleryTypeRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  daterangeCreateDate.value = [];
  daterangeUpdateDate.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.typeId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加分类管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _typeId = row.typeId || ids.value
  getGalleryType(_typeId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改分类管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["galleryTypeRef"].validate(valid => {
    if (valid) {
      if (form.value.typeId != null) {
        updateGalleryType(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addGalleryType(form.value).then(response => {
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
  const _typeIds = row.typeId || ids.value;
  proxy.$modal.confirm('是否确认删除分类管理编号为"' + _typeIds + '"的数据项？').then(function() {
    return delGalleryType(_typeIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('gallery/galleryType/export', {
    ...queryParams.value
  }, `galleryType_${new Date().getTime()}.xlsx`)
}

getList();
</script>
