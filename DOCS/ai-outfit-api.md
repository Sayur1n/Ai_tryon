HTTP调用接口
功能描述
用于生成人物试衣图片。

前提条件
已开通阿里云百炼服务并获得API-KEY：获取API Key。

作业提交接口
 
POST https://dashscope.aliyuncs.com/api/v1/services/aigc/image2image/image-synthesis
说明
因该算法调用耗时较长，故采用异步调用的方式提交任务。

任务提交之后，系统会返回对应的作业ID，后续可通过“作业任务状态查询和结果获取接口”获取任务状态及对应结果。

入参描述






字段

类型

传参方式

必选

描述

示例值

Content-Type

String

Header

是

请求类型：application/json

application/json

Authorization

String

Header

是

API-Key，例如：Bearer d1**2a

Bearer d1**2a

X-DashScope-Async

String

Header

是

使用 enable，表明使用异步方式提交作业。

enable

model

String

Body

是

指明需要调用的模型。

aitryon-plus

input.person_image_url

String

Body

是

用户上传的模特人物图片URL。

URL 需为公网可访问的地址，并支持 HTTP 或 HTTPS 协议。您也可在此获取临时公网URL。

5KB≤图像文件≤5M

150≤图像边长≤4096

格式支持：jpg、png、jpeg、bmp、heic

需保持图片中有且仅有一个完整的人

上传图片仅支持HTTP链接，不支持本地路径

http://aaa/3.jpg

input.top_garment_url

String

Body

否

用户上传的上装服饰图片URL。

URL 需为公网可访问的地址，并支持 HTTP 或 HTTPS 协议。您也可在此获取临时公网URL。

5KB≤图像文件≤5M

150≤图像边长≤4096

格式支持：jpg、png、jpeg、bmp、heic

需上传服饰平铺图，保持服饰是单一主体且完整，背景干净，四周不宜留白过多

上传图片仅支持HTTP链接，不支持本地路径

说明
上装或下装服饰图片需至少输入一个。

上装图片置空时，上装效果将随机生成。

连衣裙应作为上装输入，并将下装置空。

http://aaa/1.jpg

input.bottom_garment_url

String

Body

否

用户上传的下装服饰图片URL。

URL 需为公网可访问的地址，并支持 HTTP 或 HTTPS 协议。您也可在此获取临时公网URL。

5KB≤图像文件≤5M

150≤图像边长≤4096

格式支持：jpg、png、jpeg、bmp、heic

需上传服饰平拍图，保持服饰是单一主体且完整，背景干净，四周不宜留白过多

上传图片仅支持HTTP链接，不支持本地路径

说明
上装或下装服饰图片需至少输入一个。

下装图片置空时，下装效果将随机生成。

http://aaa/2.jpg

parameters.resolution

Int

Body

否

输出图片的分辨率控制。包含3个选项：

值为1024代表（576x1024）；

值为1280代表（720x1280）；

值为-1代表还原到原图大小，默认为-1。

说明
若后续还需调用AI试衣图片精修API，该值必须设为-1。

-1

parameters.restore_face

Bool

Body

否

输出图片模特脸部的还原控制。包含2个选项：

值为false时会生成新的人脸；

值为true时会还原原图人脸，默认为true。

说明
若后续还需调用AI试衣图片精修API，该值必须设为true。

true

出参描述




字段

类型

描述

示例值

output.task_id

String

提交异步任务的作业id，实际作业结果需要通过异步任务查询接口获取。

a8532587-fa8c-4ef8-82be-0c46b17950d1

output.task_status

String

提交异步任务后的作业状态。

PENDING

request_id

String

本次请求的系统唯一码

7574ee8f-38a3-4b1e-9280-11c33ab46e51

请求示例
 
curl --location 'https://dashscope.aliyuncs.com/api/v1/services/aigc/image2image/image-synthesis/' \
--header 'X-DashScope-Async: enable' \
--header 'Authorization: Bearer <YOUR_API_KEY>' \
--header 'Content-Type: application/json' \
--data '{
    "model": "aitryon-plus",
    "input": {
        "top_garment_url": "http://xxx/1.jpg",
        "bottom_garment_url": "http://xxx/2.jpg",
        "person_image_url": "http://xxx/3.jpg"
    },
    "parameters": {
        "resolution": -1,
        "restore_face": true
    }
  }'
响应示例
 
{
    "output": {
	"task_id": "a8532587-fa8c-4ef8-82be-0c46b17950d1", 
    	"task_status": "PENDING"
    }
    "request_id": "7574ee8f-38a3-4b1e-9280-11c33ab46e51"
}
作业任务状态查询和结果获取接口
 
GET https://dashscope.aliyuncs.com/api/v1/tasks/{task_id}
说明
异步任务查询接口提供 20 QPS 的访问流量限制。若有更高频次的查询需求，可通过EventBridge配置事件转发，详见配置异步任务回调。

已提交的异步任务列表查询，及异步任务的取消管理，详见管理异步任务。

入参描述






字段

类型

传参方式

必选

描述

示例值

Authorization

String

Header

是

API-Key，例如：Bearer sk-xxx。

Bearer sk-xxx

task_id

String

Url Path

是

需要查询作业的 task_id。

a8532587-fa8c-4ef8-82be-0c46b17950d1

出参描述




字段

类型

描述

示例值

output.task_id

String

查询作业的 task_id

a8532587-fa8c-4ef8-82be-0c46b17950d1

output.task_status

String

被查询作业的作业状态

任务状态：

PENDING 排队中

PRE-PROCESSING 前置处理中

RUNNING 处理中

POST-PROCESSING 后置处理中

SUCCEEDED 成功

FAILED 失败

UNKNOWN 作业不存在或状态未知

CANCELED：任务取消成功

output.image_url

String

生成的结果物地址，

image_url有效期为作业完成后24小时

{"image_url":"https://xxx/1.jpg"}

usage.image_count

Int

本次请求生成图片张数

"image_count": 1

request_id

String

本次请求的系统唯一码

7574ee8f-38a3-4b1e-9280-11c33ab46e51

请求示例
 
curl -X GET \
 --header 'Authorization: Bearer <YOUR_API_KEY>' \
 'https://dashscope.aliyuncs.com/api/v1/tasks/<YOUR_TASK_ID>'
响应示例
 
{
  "request_id": "xxx",
  "output": {
    "task_id": "xxx",
    "task_status": "SUCCEEDED",
    "submit_time": "2024-07-30 15:39:39.918",
    "scheduled_time": "2024-07-30 15:39:39.941",
    "end_time": "2024-07-30 15:39:55.080",
    "image_url": "YOUR_IMAGE_URL"
  },
  "usage": {
    "image_count": 1
  }
}
异常响应示例
 
{
    "request_id": "6bf4693b-c6d0-933a-b7b7-f625d098d742",
    "output": {
        "task_id": "e32bd911-5a3d-4687-bf53-9aaef32213e9",
        "task_status": "FAILED",
        "code": "xxx",
        "message": "xxxxxx"
  }
}
状态码说明
大模型服务通用状态码请查阅：错误信息

同时本模型还有如下特定错误码：





HTTP返回码

错误码（code）

错误信息（message）

含义说明

400

InvalidParameter

The request is missing required parameters or in a wrong format, please check the parameters that you send.

入参格式不对

400

InvalidURL

The request URL is invalid, please check the request URL is available and the request image format is one of the following types: JPEG, JPG, PNG, BMP, and WEBP.

图片URL访问失败，请检查URL或文件格式

400

InvalidPerson

The input image has no human body or multi human bodies. Please upload other image with single person.

输入图片中没有人或多人主体

400

InvalidGarment

Missing clothing image.Please input at least one top garment or bottom garment image.

缺少服饰图片。至少输入1张上装或下装图片

400

InvalidInputLength

The image resolution is invalid, please make sure that the largest length of image is smaller than 4096, and the smallest length of image is larger than 150. and the size of image ranges from 5KB to 5MB

上传图片大小不符合要求


