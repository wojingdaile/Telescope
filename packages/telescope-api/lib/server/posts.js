GetPostFromJsonString = function(jsonString) {

  console.log("get post from json string: " + jsonString);
  var providePostProperties = ['author', 'body', 'categories', 'htmlBody', 'inactive', 'status', 'sticky', 'title', 'userId'];
  var defaultPost = {
    baseScore: 0,
    clickCount: 0,
    commentConut: 0,
    commenters: [],
    createdAt: new Date(),
    downvotes: 0,
    postedAt: new Date(),
    score: 0,
    upvoters: [],
    upvotes: 0,
    viewCount: 0
  };

  var newPost = defaultPost;
  var res = true;
  var missingProperty;
  providePostProperties.forEach(function(property) {

    if (jsonString[property] == undefined) {
      missingProperty = property;
      res = false;
      return;
    } else {
      newPost[property] = jsonString[property];
    }
  });

  var result;
  if (!res) {
    result = {
      result: false,
      error: "property not found: " + missingProperty
    };
  } else {
    result = {
      result: true,
      post: newPost
    };
  }
  return result;
}

GetCategoryPosts = function(categorySegment, parseId, limitSegment, skip) {
  var posts = [];
  var category = typeof limitSegment === 'undefined' ? 'top' : categorySegment;
  var limit = typeof limitSegment === 'undefined' ? 20 : limitSegment // default limit: 20 posts
  skip = typeof skip === 'undefined' ? 0 : skip;

  Posts.find({
    categories: [category],
    status: STATUS_APPROVED
  }).forEach(function(post) {

    var url = getPostLink(post);
    var hasUpvote = false;
    if (parseId.length > 0) {
      if (post.upvoters.contains(parseId)) {
        hasUpvote = true;
      }
    }
    var properties = {
      title: post.title,
      headline: post.title, // for backwards compatibility
      author: post.author,
      date: post.postedAt,
      url: url,
      guid: post._id,
      attachments: post.attachment,
      upvotes: post.upvoters.length,
      upvoted: hasUpvote,
      userId: post.userId
    };

    if (post.body)
      properties.body = post.body;

    if (post.url)
      properties.domain = getDomain(url);

    if (twitterName = getTwitterNameById(post.userId))
      properties.twitterName = twitterName;
      
    posts.push(properties);
  });
  var res = {
    posts: posts
  };
  return JSON.stringify(res);
};



DeletePost = function(deletePostId, response) {

  var deletePostItem = Posts.findOne({
    _id: deletePostId
  });
  if (deletePostItem) {
    Posts.remove(deletePostItem, function(error) {
      if (error) {
        var result = {
          result: false,
          error: error
        };
        response.write(JSON.stringify(result));
        response.end();
      } else {
        var result = {
          result: true
        };
        response.write(JSON.stringify(result));
        response.end();
      }
    });
  } else {
    var result = {
      result: false,
      reson: "delete post not found"
    };
    response.write(JSON.stringify(result));
    response.end();
  }
}

AddPost = function(newPost, response) {

  console.log("add new post:" + newPost);
  var userId = newPost.userId;
  if (!userId) {
    var result = {
      result: false,
      error: "new post must has userId"
    };
    response.write(JSON.stringify(result));
    response.end();
    return;
  }

  Posts.insert(newPost, function(error, newPostId) {
    if (error) {
      var result = {
        result: false,
        error: error
      };
      response.write(JSON.stringify(result));
    } else {
      var result = {
        result: true,
        postId: newPostId
      };
      AddPostCount(userId);
      response.write(JSON.stringify(result));
    }
    response.end();
  })
}

UpVotePost = function(postId, userId, response) {
  //TODO: add user id to upvoters
  if (!postId || !userId) {
    result = {
      result: false,
      error: "params error"
    };
    response.write(JSON.stringify(result));
    response.end();
    return;
  }

  var user = Meteor.users.findOne({
    _id: userId
  });
  var item = Posts.findOne({
    _id: postId
  });
  var result = upvoteItem(Posts, item, user);

  response.write(JSON.stringify({
    result: result
  }));
  response.end();
}

DownVotePost = function(postId, userId, response) {

  if (!postId || !userId) {
    result = {
      result: false,
      error: "params error"
    };
    response.write(JSON.stringify(result));
    response.end();
    return;
  }

  var user = Meteor.users.findOne({
    _id: userId
  });
  var item = Posts.findOne({
    _id: postId
  });
  var result = downvoteItem(Posts, item, user);

  response.write(JSON.stringify({
    result: result
  }));
  response.end();
}

UpdatePost = function(postId, newBody, response) {
  Posts.update({
    _id: postId
  }, {
    body: newBody,
    postedAt: new Date()
  }, function(error, numOfFileAffected) {
    var result;
    if (error) {
      result = {
        result: false,
        error: error
      };
    } else {
      result = {
        result: true,
        numOfDocAffected: numOfDocAffected
      };
    }
    response.write(JSON.stringify(result));
    response.end();
  })
}
