# 阿里云 OSS 配置说明

## HTTPS 协议配置

本项目已配置为强制使用 HTTPS 协议访问阿里云 OSS，确保所有图片上传都返回 HTTPS 地址，避免混合内容警告。

## 初始化

请注意，以下代码示例默认使用Bucket公网域名以及RAM用户的AK信息。

```javascript
const OSS = require('ali-oss');

const client = new OSS({
  // 从环境变量中获取访问凭证。运行本代码示例之前，请确保已设置环境变量OSS_ACCESS_KEY_ID和OSS_ACCESS_KEY_SECRET。
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  // yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
  region: 'oss-cn-hangzhou',
  // 使用V4签名算法
  authorizationV4: true,
  // yourBucketName填写Bucket名称。
  bucket: 'yourBucketName',
  // yourEndpoint填写Bucket所在地域对应的公网Endpoint。以华东1（杭州）为例，Endpoint填写为https://oss-cn-hangzhou.aliyuncs.com。
  endpoint: 'https://oss-cn-hangzhou.aliyuncs.com',
});
```

## 项目中的 OSS 工具函数

项目使用 `src/lib/oss-utils.ts` 中的工具函数进行文件上传，确保返回 HTTPS 地址：

- `uploadFileToOSS(file, type)` - 上传本地文件到 OSS
- `uploadRemoteImageToOSS(imageUrl, key)` - 上传远程图片到 OSS
- `ensureHTTPS(url)` - 确保 URL 使用 HTTPS 协议


Node.js快速入门
更新时间：2025-06-13 16:11:32
产品详情
我的收藏
本文介绍如何在Node.js环境中快速使用OSS服务，包括查看存储空间（Bucket） 列表、上传文件（Object）等。

前提条件
已完成初始化。具体操作，请参见初始化。

查看存储空间列表
以下代码用于查看存储空间列表。

 
const OSS = require('ali-oss');

const client = new OSS({
  // yourregion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
  region: 'yourregion',
  // 从环境变量中获取访问凭证。运行本代码示例之前，请确保已设置环境变量OSS_ACCESS_KEY_ID和OSS_ACCESS_KEY_SECRET。
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  authorizationV4: true,
  // yourBucketName填写Bucket名称。
  bucket: 'yourBucketName',
});

async function listBuckets() {
  try {
    // 列举当前账号所有地域下的存储空间。
    const result = await client.listBuckets();
    console.log(result);
  } catch (err) {
    console.log(err);
  }
}

listBuckets();
查看文件列表
以下代码用于查看文件列表。

 
const OSS = require('ali-oss');

const client = new OSS({
  // yourregion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
  region: 'yourregion',
  // 从环境变量中获取访问凭证。运行本代码示例之前，请确保已设置环境变量OSS_ACCESS_KEY_ID和OSS_ACCESS_KEY_SECRET。
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  authorizationV4: true,
  // yourbucketname填写存储空间名称。
  bucket: 'yourbucketname'
});

async function list () {
    // 不带任何参数，默认最多返回100个文件。
    const result = await client.list();
    console.log(result);
}

list();
上传文件
以下代码用于上传单个文件。

 
const OSS = require('ali-oss')
const path=require("path")

const client = new OSS({
  // yourregion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
  region: 'yourregion',
  // 从环境变量中获取访问凭证。运行本代码示例之前，请确保已设置环境变量OSS_ACCESS_KEY_ID和OSS_ACCESS_KEY_SECRET。
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  authorizationV4: true,
  // 填写Bucket名称。
  bucket: 'examplebucket',
});

// 自定义请求头
const headers = {
  // 指定Object的存储类型。
  'x-oss-storage-class': 'Standard',
  // 指定Object的访问权限。
  'x-oss-object-acl': 'private',
  // 通过文件URL访问文件时，指定以附件形式下载文件，下载后的文件名称定义为example.txt。
  'Content-Disposition': 'attachment; filename="example.txt"',
  // 设置Object的标签，可同时设置多个标签。
  'x-oss-tagging': 'Tag1=1&Tag2=2',
  // 指定PutObject操作时是否覆盖同名目标Object。此处设置为true，表示禁止覆盖同名Object。
  'x-oss-forbid-overwrite': 'true',
};

async function put () {
  try {
    // 填写OSS文件完整路径和本地文件的完整路径。OSS文件完整路径中不能包含Bucket名称。
    // 如果本地文件的完整路径中未指定本地路径，则默认从示例程序所属项目对应本地路径中上传文件。
    const result = await client.put('exampleobject.txt', path.normalize('D:\\localpath\\examplefile.txt')
    // 自定义headers
    ,{headers}
    );
    console.log(result);
  } catch (e) {
    console.log(e);
  }
}

put();
下载文件
以下代码用于下载单个文件。

 
const OSS = require('ali-oss');

const client = new OSS({
  // yourregion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
  region: 'yourRegion',
  // 从环境变量中获取访问凭证。运行本代码示例之前，请确保已设置环境变量OSS_ACCESS_KEY_ID和OSS_ACCESS_KEY_SECRET。
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  authorizationV4: true,
  // 填写Bucket名称。
  bucket: 'examplebucket'
});

async function get () {
  try {
    // 填写Object完整路径和本地文件的完整路径。Object完整路径中不能包含Bucket名称。
    // 如果指定的本地文件存在会覆盖，不存在则新建。
    // 如果未指定本地路径，则下载后的文件默认保存到示例程序所属项目对应本地路径中。
    const result = await client.get('exampleobject.txt', 'D:\\localpath\\examplefile.txt');
    console.log(result);
  } catch (e) {
    console.log(e);
  }
}

get(); 
删除单个文件
以下代码用于删除单个文件。

 
const OSS = require('ali-oss');

const client = new OSS({
  // oss-cn-hangzhou填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
  region: 'oss-cn-hangzhou',
  // 从环境变量中获取访问凭证。运行本代码示例之前，请确保已设置环境变量OSS_ACCESS_KEY_ID和OSS_ACCESS_KEY_SECRET。
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  authorizationV4: true,
  // 填写Bucket名称。
  bucket: 'examplebucket',
});

async function deleteObject() {
  try {
    // 填写Object完整路径。Object完整路径中不能包含Bucket名称。
    const result = await client.delete('exampleobject.txt');
    console.log(result);
  } catch (error) {
    console.log(error);
  }
}

deleteObject();

