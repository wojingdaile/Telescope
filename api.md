#Authentication
>出于简单考虑，API将不保存Session，
>所有请求都必须带上X-API-USER-ID
>所有写操作都会根据这个userid去进行权限校验

#Category

###获取Category：**GET** [/api/categories?limit=3]()
>limit参数为需要获取的category个数


```
json
{
	categories:[]
}
```

###~~创建Category~~：**POST** [/api/categories]()
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

###~~删除Category~~： **DELETE** [/api/categories?categoryId=<_id>]()
>删除一个Category
>><_id>：删除category的id

```
{
    "result": true,
    "categoryId": "52KXqJPBF8F9o4JEA"
}

{
    "result": false,
    "error": "error info"
}
```
#Post
###获取Posts：**GET** [/api/posts?limit=10&skip=20&category=<_id>]()
>获取Post
>> limit: 获取的post的数量

>> skip: 从第几个post开始取

>> category: 从哪个category获取posts
```
json
{
	posts:[]
}
```

###创建Post：**POST** [/api/posts]()
> POST 数据结构

```
{
    "author" : "xionggai",
    "body":  "Hello World",
    "categories": [],
    "htmlBody" : "<p>Hello World</p>\n",
    "inactive" : false,
    "status" : 2,
    "sticky" : false,
    "title" : "just for test",
    "userId" : "AtkugG9xemuc5yKge",
}
```

###删除Post：**DELETE** [/api/posts?postId=<_id>]()
> 删除帖子
> ><_id>为需要删除帖子的id

###更新Post：**PUT**
####更新POST内容：[/api/posts?action=updatePost]()
>PUT数据结构

```
{
	"postId": "123",
	"body": "new body"
}
```
####增加帖子点击数：[/api/posts?action=addPostClickCount]()
>PUT数据结构

```
{
	"postId": "123"
}
```

####顶帖子：[/api/posts?action=upvote]()
>PUT数据结构

```
{
	"postId": "123"
}
```

####踩帖子：[/api/posts?action=downvote]()
>PUT数据结构

```
{
	"postId": "123"
}
```


#Comments
###获取Comments：**GET** [/api/comments?postId=<_id>&limit=10&skip=20]()
>获取Comments
>> postId: 获取的哪个帖子的回复

>> limit: 获取的comment的数量

>> skip: 从第几个comment开始取
```
json
{
	comments:[]
}
```

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

###顶踩Comment: **PUT** [/api/comments?action=(upvote|downvote)]()
>PUT数据结构

```
{
	"commentId": "11233"
}
```


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


#User
###创建User：**POST**[/api/user]()
>POST数据结构

```
{
    "parseId": "xxxx",
    "services" : {
        "facebook" : {
            "accessToken" : "xxxx",
            "email" : "xkkccc@126.com",
            "expiresAt" : 1427529364531,
            "first_name" : "John",
            "gender" : "female",
            "id" : "1524970277786102",
            "last_name" : "Smith",
            "link" : "https://www.facebook.com/app_scoped_user_id/1524970277786102/",
            "locale" : "en_US",
            "name" : "John Smith"
        }
    },
    "username" : "kangcheng",
    "email" : "dev@pinssible.com",
    "avatar" : "http://"
}
```

```
{
    "parseId": "xxxx",
    "services" : {
       "twitter" : {
            "id" : "2834622025",
            "screenName" : "FancyKey",
            "accessToken" : "2834622025-rrSEn8t4DaFf3aZIMpVnMmhxDU1BAa5TIFhRRrm",
            "accessTokenSecret" : "cLPzbbxaAbnR3XBmKrsRZiDXouQVQGpMGnbpcofqXATKk",
            "profile_image_url" : "http://pbs.twimg.com/profile_images/516067919583662080/9L64SGqm_normal.jpeg",
            "profile_image_url_https" : "https://pbs.twimg.com/profile_images/516067919583662080/9L64SGqm_normal.jpeg",
            "lang" : "en"
        }
    },
    "username" : "kangcheng",
    "email" : "dev@pinssible.com",
    "avatar" : "http://"
}
```

#Avatar
###获取头像:**GET**[/api/avatar?userId=xxx]()
>返回数据结构

```
{
    "result":true,
    "avatar":"http://graph.facebook.com/1578938125680529/picture"
}
```

```
{
    "result":true,
    "error":"user not found"
}
```
