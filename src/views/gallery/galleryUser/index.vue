<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="用户名称" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入用户名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="用户qq" prop="userQq">
        <el-input
          v-model="queryParams.userQq"
          placeholder="请输入用户qq"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
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
          v-hasPermi="['gallery:galleryUser:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['gallery:galleryUser:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['gallery:galleryUser:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['gallery:galleryUser:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="galleryUserList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="用户编号" align="center" prop="userId" />
      <el-table-column label="用户积分" align="center" prop="userIntegral" />
      <el-table-column label="用户名称" align="center" prop="userName" />
      <el-table-column label="用户账号" align="center" prop="userAccount" />
      <el-table-column label="用户头像" align="center" prop="userAvatar">
        <template #default="scope">
          <el-image :src="imgHost + scope.row.userAvatar" style="width: 40px; height: 40px;"></el-image>
        </template>
      </el-table-column>
      <el-table-column label="用户qq" align="center" prop="userQq" />
      <el-table-column label="用户性别" align="center" prop="userSex" :formatter="formatUserSex"/>
      <el-table-column label="用户收藏数量" align="center" prop="userCollect" />
      <el-table-column label="账号创建时间" align="center" prop="createDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createDate, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="账号状态" align="center" prop="userStatus">
        <template #default="{ row }">
          <el-tag :type="row.userStatus === 0 ? 'success' : 'danger'">
            {{ row.userStatus === 0 ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['gallery:galleryUser:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['gallery:galleryUser:remove']">删除</el-button>
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

    <!-- 添加或修改用户管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="galleryUserRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户头像" prop="userAvatar">
          <el-image :src="imgHost + form.userAvatar" style="width: 100px; height: 100px;" fit="cover"></el-image>
        </el-form-item>
        <el-form-item label="微信编号" prop="userUnionid">
          <el-input v-model="form.userUnionid" placeholder="请输入微信编号" />
        </el-form-item>
        <el-form-item v-if="title=='修改用户管理'" label="用户积分" prop="userIntegral">
          <el-input v-model="form.userIntegral" placeholder="请输入用户积分" />
        </el-form-item>
        <el-form-item label="用户名称" prop="userName">
          <el-input v-model="form.userName" placeholder="请输入用户名称" />
        </el-form-item>
        <el-form-item label="用户账号" prop="userAccount">
          <el-input v-model="form.userAccount" placeholder="请输入用户账号" />
        </el-form-item>
        <el-form-item label="用户密码" prop="userPassword">
          <el-input v-model="form.userPassword" placeholder="请输入用户密码" />
        </el-form-item>
        <el-form-item label="用户邮箱" prop="userEmail">
          <el-input v-model="form.userEmail" placeholder="请输入用户邮箱" />
        </el-form-item>
        <el-form-item label="用户qq" prop="userQq">
          <el-input v-model="form.userQq" placeholder="请输入用户qq" />
        </el-form-item>
        <el-form-item v-if="title=='修改用户管理'" label="用户性别" prop="userSex">
          <el-select v-model="form.userSex" placeholder="请选择用户性别">
            <el-option label="男" :value="1"></el-option>
            <el-option label="女" :value="0"></el-option>
            <el-option label="未知" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="title=='修改用户管理'" label="收藏数量" prop="userCollect">
          <el-input v-model="form.userCollect" placeholder="请输入用户收藏数量" />
        </el-form-item>
        <el-form-item v-if="title=='修改用户管理'" label="下载次数" prop="userDownCount">
          <el-input v-model="form.userDownCount" placeholder="请输入用户剩余下载次数" />
        </el-form-item>
        <el-form-item v-if="title=='修改用户管理'" label="上传次数" prop="userUploadCount">
          <el-input v-model="form.userUploadCount" placeholder="请输入用户剩余上传次数" />
        </el-form-item>
        <el-form-item v-if="title=='修改用户管理'" label="账号状态" prop="userStatus">
          <el-radio-group v-model="form.userStatus">
            <el-radio :label="0">正常</el-radio>
            <el-radio :label="1">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="创建时间" prop="createDate">
          <el-date-picker clearable
            v-model="form.createDate"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择账号创建时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item v-if="title=='修改用户管理'" label="修改时间" prop="updateDate">
          <el-date-picker clearable
            v-model="form.updateDate"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="修改时间">
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

<script setup name="GalleryUser">
import { listGalleryUser, getGalleryUser, delGalleryUser, addGalleryUser, updateGalleryUser } from "@/api/gallery/galleryUser";

const { proxy } = getCurrentInstance();

const galleryUserList = ref([]);
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
const imgHost = import.meta.env.VITE_APP_BASE_IMG

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userName: null,
    userQq: null,
    createDate: null,
    userStatus: null,
  },
  rules: {
    userName: [
      { required: true, message: "用户名称不能为空", trigger: "blur" }
    ],
    userAccount: [
      { required: true, message: "用户账号不能为空", trigger: "blur" }
    ],
    userPassword: [
      { required: true, message: "用户密码不能为空", trigger: "blur" }
    ],
    userAvatar: [
      { required: true, message: "用户头像不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

function formatUserSex(row, column, cellValue) {
  switch (cellValue) {
    case 0:
      return '女';
    case 1:
      return '男';
    case 2:
      return '未知';
    default:
      return '异常';
    }
}

/** 查询用户管理列表 */
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
  listGalleryUser(queryParams.value).then(response => {
    galleryUserList.value = response.rows;
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
    userId: null,
    userUnionid: null,
    userIntegral: null,
    userName: null,
    userAccount: null,
    userPassword: null,
    userAvatar: '/头像/default.png',
    userEmail: null,
    userQq: null,
    userSex: null,
    userCollect: null,
    userDownCount: null,
    userUploadCount: null,
    createDate: null,
    updateDate: null,
    userStatus: null,
  };
  proxy.resetForm("galleryUserRef");
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
  ids.value = selection.map(item => item.userId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加用户管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _userId = row.userId || ids.value
  getGalleryUser(_userId).then(response => {
    console.log('response :>> ', response);
    form.value = response.data;
    open.value = true;
    title.value = "修改用户管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["galleryUserRef"].validate(valid => {
    if (valid) {
      if (form.value.userId != null) {
        updateGalleryUser(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addGalleryUser(form.value).then(response => {
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
  const _userIds = row.userId || ids.value;
  proxy.$modal.confirm('是否确认删除用户管理编号为"' + _userIds + '"的数据项？').then(function() {
    return delGalleryUser(_userIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('gallery/galleryUser/export', {
    ...queryParams.value
  }, `galleryUser_${new Date().getTime()}.xlsx`)
}

getList();
</script>
