#Authentication
>出于简单考虑，API将不保存Session，
>所有请求都必须带上X-API-USER-ID
>所有写操作都会根据这个userid去进行权限校验

#Category
>操作Category数据

###获取Category：**GET** [/api/category/:limit?]()
>limit参数为需要获取的category个数

###创建Category：**POST** [/api/category]()
>POST 数据结构：

```json
{

}
```

###删除Category： **DELETE** [/api/category/:_id?]()
>删除一个Category

#Post
###获取Posts：**GET** [/api/post?limit=10&skip=20&category=<_id>]()
>获取Post
>> limit: 获取的post的数量
>> skip: 从第几个post开始取
>> category: 从哪个category获取posts

###创建Post：**POST** [/api/post]
> POST 数据结构

```json
{

}
```

###删除Post：**DELETE** [/api/post/:_id?]()
> 删除帖子

###回复Post：**POST** [/api/post/comment]()
> POST 数据结构

```json
{

}
```

###顶Post：**POST** [/api/post/upvote/:_id?]()
> 顶贴

###踩Post: **POST** [/api/post/downvote/:_id?]()
> 踩帖子

#Comments
###获取Comments：**GET** [/api/comments?post_id=<_id>&comment_id=<_id>&limit=10&skip=20]()
>获取Comments
>> limit: 获取的post的数量
>> skip: 从第几个post开始取
>> post_id: 获取哪个帖子的回复
>> comment_id：获取哪个回复的回复，优先级大于post_id(目前还没有需求要获取一个回复的回复，该参数还未支持)

###回复Comment：**POST** [/api/comments]
> POST 结构

```json
{

}
```

###删除Comment： **POST** [/api/comments/:_id?]()
> 删除回复

#User
TODO: 整合ParseUser
