GetPostFromJsonString = function(jsonString) {

  console.log("get post from json string: " + JSON.stringify(jsonString));
  var userId = jsonString["userId"];
  var parseId;
  if(userId == undefined){
    result = {
      result: false,
      error: "property not found: userId"
    };
    return result;
  }
  else{
    var user =  Meteor.users.findOne({_id: userId});
    if(user == undefined){
      result = {
        result: false,
        error: "user not found"
      };
      return result;
    }
    else{
      parseId = user.parseId;
    }
  }

  var providePostProperties = ['author', 'body', 'categories', 'status', 'title', 'userId'];
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
    viewCount: 0,
    inactive: true,
    sticky: false,
    parseId: parseId
  };

  var newPost = defaultPost;
  var res = true;
  var missingProperty;
  providePostProperties.forEach(function(property) {

    if (property == "categories") {
      newPost["categories"] = [jsonString["categories"]];
    } else {
      if (jsonString[property] == undefined) {
        missingProperty = property;
        res = false;
        return;
      } else {
        newPost[property] = jsonString[property];
      }
    }

  });

  if(jsonString["attactments"] != undefined){
    newPost["attactments"] = jsonString["attactments"];
  }

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

GetCategoryPosts = function(categorySegment, userId, limitSegment, skip) {
  var posts = [];
  var category = typeof limitSegment === 'undefined' ? 'top' : categorySegment;
  var limit = typeof limitSegment === 'undefined' ? 20 : limitSegment // default limit: 20 posts
  skip = typeof skip === 'undefined' ? 0 : skip;

  Posts.find({
    categories: [category],
    status: STATUS_APPROVED
  },{sort: {createdAt: -1},limit: limit,skip: skip}).forEach(function(post) {

    var url = getPostLink(post);
    var hasUpvote = false;
    var hasDownVote = false;
    if (userId != undefined && userId.length > 0) {
      if ((post.upvoters != undefined) && post.upvoters.contains(userId)) {
        hasUpvote = true;
      }
      if(post.downvoters != undefined && post.downvoters.contains(userId)){
        hasDownVote = true;
      }
    }

    var avatar = "";
    var isAuthorVIP  = false;
    if(post.userId != undefined){
      var user = Meteor.users.findOne({_id: post.userId});
      if (user != undefined) {
          avatar = user.avatar;
          isAuthorVIP = user.isVIP;
        };
    }
    var properties = {
      title: post.title,
      headline: post.title, // for backwards compatibility
      author: post.author,
      date: post.postedAt,
      url: url,
      guid: post._id,
      attachments: post.attachment,
      upvotes: post.upvotes,
      downvotes: post.downvotes,
      upvoted: hasUpvote,
      downvoted: hasDownVote,
      userId: post.userId,
      commentCount: post.commentCount,
      parseId:post.parseId,
      avatar: avatar,
      isAuthorVIP: isAuthorVIP

    };
    if (post.body)
      properties.body = post.body;
    if(post.htmlBody)
      properties.htmlBody = post.htmlBody;
    if(post.attactments)
      properties.attactments = post.attactments;
    if (post.version != undefined)
        properties.version = post.version;

    if (post.url)
      properties.domain = getDomain(url);
    // console.log("get twitter " + post.userId);
    // if(twitterName = getTwitterNameById(post.userId))
    //   console.log("get twitter " + twitterName);
    //   properties.twitterName = twitterName;

    /*
    var comments = [];

    Comments.find({postId: post._id}, {sort: {postedAt: -1}, limit: 50}).forEach(function(comment) {
      var commentProperties = {
        body: comment.body,
        author: comment.author,
        date: comment.postedAt,
        guid: comment._id,
        parentCommentId: comment.parentCommentId
      };
      comments.push(commentProperties);
    });

    var commentsToDelete = [];

    comments.forEach(function(comment, index) {
      if (comment.parentCommentId) {
        var parent = comments.filter(function(obj) {
          return obj.guid === comment.parentCommentId;
        })[0];
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(JSON.parse(JSON.stringify(comment)));
          commentsToDelete.push(index)
        }
      }
    });

    commentsToDelete.reverse().forEach(function(index) {
      comments.splice(index,1);
    });

    properties.comments = comments;
    */
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

  // temporarily spam filter with RegEx, should be replaced with DFA
  var title = newPost.title || "";
  var text = newPost.body || "";
  var text = title + text;
  if (text.toLowerCase().match(badWordsReg)) {
      var result = {
          result: false,
          error: "Be polite and no cursing"
        };
        response.write(JSON.stringify(result));
        response.end();
        return;
  }

  console.log("insert new post:" + JSON.stringify(newPost));
  Posts.insert(newPost, function(error, newPostId) {
    if (error) {
      var result = {
        result: false,
        error: error.reason
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

DeUpVotePost = function(postId, userId, response){

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
  var result = cancelUpvote(Posts, item, user);
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

DeDownVotePost = function(postId, userId, response) {

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
  var result = cancelDownvote(Posts, item, user);
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
        numOfFileAffected: numOfFileAffected
      };
    }
    response.write(JSON.stringify(result));
    response.end();
  })
}

AddAttacments = function(postId, attacments, response){

  Posts.update({
    _id:postId
  },
  {
    $set: {attactments : attacments}
  }, function(error, numOfFileAffected){
    var result;
    if (error) {
      result = {
        result: false,
        error: error
      };
    } else {
      result = {
        result: true,
        numOfFileAffected: numOfFileAffected
      };
    }
    response.write(JSON.stringify(result));
    response.end();
  });
}
