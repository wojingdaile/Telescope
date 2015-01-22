#Authentication
>出于简单考虑，API将不保存Session，
>所有请求都必须带上X-API-USER-ID
>所有写操作都会根据这个userid去进行权限校验

#Category

###获取Category：**GET** [/api/category?limit=3]()
>limit参数为需要获取的category个数

###创建Category：**POST** [/api/category]()
>POST 数据结构：

```
json
{
    "name" : "FAQ",
    "description" : "Frequently Asked Questions",
    "order" : 0,
    "slug" : "FAQ_slug",
}
```

###删除Category： **DELETE** [/api/category?categoryId=<_id>]()
>删除一个Category
>><_id>：删除category的id

#Post
###获取Posts：**GET** [/api/post?limit=10&skip=20&category=<_id>]()
>获取Post
>> limit: 获取的post的数量

>> skip: 从第几个post开始取

>> category: 从哪个category获取posts

###创建Post：**POST** [/api/post]()
> POST 数据结构

```
{
    "author" : "xionggai",
    "baseScore" : 1,
    "body" : "Hello World",
    "clickCount" : 0,
    "commentCount" : 5,
    "commenters" : [ 
        "AtkugG9xemuc5yKge"
    ],
    "createdAt" : ISODate("2015-01-19T06:21:29.592Z"),
    "downvotes" : 0,
    "htmlBody" : "<p>Hello World</p>\n",
    "inactive" : false,
    "lastCommentedAt" : ISODate("2015-01-19T08:46:15.438Z"),
    "postedAt" : ISODate("2015-01-19T06:21:00.000Z"),
    "score" : 0.004025308134229659,
    "status" : 2,
    "sticky" : false,
    "title" : "just for test",
    "upvoters" : [ 
        "AtkugG9xemuc5yKge"
    ],
    "upvotes" : 1,
    "userId" : "AtkugG9xemuc5yKge",
    "viewCount" : 9
}
```

###删除Post：**DELETE** [/api/post?postId=<_id>]()
> 删除帖子
> ><_id>为需要删除帖子的id


#Comments
###获取Comments：**GET** [/api/comments?postId=<_id>&limit=10&skip=20]()
>获取Comments
>> postId: 获取的哪个帖子的回复

>> limit: 获取的comment的数量

>> skip: 从第几个comment开始取


###回复Comment：**POST** [/api/comments]()
> POST 结构

```
{
    "author" : "xionggai",
    "baseScore" : 1,
    "body" : "reply hello",
    "createdAt" : ISODate("2015-01-19T08:45:40.658Z"),
    "downvotes" : 0,
    "htmlBody" : "<p>reply hello</p>\n",
    "inactive" : false,
    "parentCommentId" : "x2BSB5cW95NDirb93",
    "postId" : "smEdcocbizmyPwhJf",
    "postedAt" : ISODate("2015-01-19T08:45:40.658Z"),
    "score" : 0.004214175026677331,
    "upvoters" : [ 
        "AtkugG9xemuc5yKge"
    ],
    "upvotes" : 1,
    "userId" : "AtkugG9xemuc5yKge"
}
```

###删除Comment： **DELETE** [/api/comments?commentId=<_id>]()
> 删除回复
> ><_id>:需要删除的comment的id

#回复post
###回复Post：**POST** [/api/commentPost]()
> POST 数据结构

```
{
    "author" : "xionggai",
    "baseScore" : 1,
    "body" : "reply hello",
    "createdAt" : ISODate("2015-01-19T08:45:40.658Z"),
    "downvotes" : 0,
    "htmlBody" : "<p>reply hello</p>\n",
    "inactive" : false,
    "postId" : "smEdcocbizmyPwhJf",
    "postedAt" : ISODate("2015-01-19T08:45:40.658Z"),
    "score" : 0.004214175026677331,
    "upvoters" : [ 
        "AtkugG9xemuc5yKge"
    ],
    "upvotes" : 1,
    "userId" : "AtkugG9xemuc5yKge"
}
```

#顶&踩
###顶：**POST** [/api/upvote?type=(post/comment)&id=<_id>]()
> type:顶的类型，post或者comment；
> 
> id：顶的post或者comment的id；

###踩: **POST** [/api/downvote?type=(post/comment)&id=<_id>]()
> type：踩的类型，post或者comment；

> id: 踩的post或者comment的id；



#User
TODO: 整合ParseUser
