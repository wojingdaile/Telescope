GetPostFromJsonString = function(jsonString){

  console.log("get post from json string: " + JSON.stringify(jsonString));
  var providePostProperties = ['author', 'body',  'htmlBody', ,'categories' ,'status', 'title', 'userId'];
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
       sticky: false
  };

    var newPost = defaultPost;
    var res = true;
    var missingProperty;
    providePostProperties.forEach(function(property){
      
      if(property == "categories"){
          newPost["categories"] = [jsonString["categories"]];
      }
      else{
        if(jsonString[property] == undefined){
          missingProperty = property;
          res = false;
          return;
      }
      else{
          newPost[property] = jsonString[property];
      }
      }

    });

    var result;
    if(!res){
      result = {
        result: false,
        error: "property not found: " + missingProperty
      };
    }
    else{
      result = {
        result: true,
        post: newPost
      };
    }
    return result;
}

GetCategoryPosts = function(categorySegment, parseId, limitSegment, skip){
  var posts = [];
  var category = typeof limitSegment === 'undefined' ? 'top' : categorySegment;
  var limit = typeof limitSegment === 'undefined' ? 20 : limitSegment // default limit: 20 posts
  skip  = typeof skip === 'undefined' ? 0 : skip;

  Posts.find({categories: [category], status: STATUS_APPROVED}).forEach(function(post) {

    var url = getPostLink(post);
    var hasUpvote = false;
    if(parseId.length > 0){
      if(post.upvoters.contains(parseId)){
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
      upvotes:post.upvoters.length,
      upvoted: hasUpvote,
      userId: post.userId
    };

    if(post.body)
      properties.body = post.body;

      if(post.url)
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



DeletePost = function(deletePostId, response){

  var deletePostItem = Posts.findOne({_id: deletePostId});
  if(deletePostItem){
    Posts.remove(deletePostItem, function(error){
      if(error){
        var result = {
          result: false,
          error: error
        };
        response.write(JSON.stringify(result));
        response.end();
      }
      else{
        var result = {
          result: true
        };
        response.write(JSON.stringify(result));
        response.end();
      }
    });
  }
  else{
    var result = {
      result: false,
      reson: "delete post not found"
    };
    response.write(JSON.stringify(result));
    response.end();
  }
}

AddPost = function(newPost, response){

  console.log("add new post:" + newPost);
  var userId = newPost.userId;
  if(!userId){
    var result = {
        result: false,
        error: "new post must has userId"
      };
      response.write(JSON.stringify(result));
      response.end();
      return;
  }
  console.log("insert new post: " + JSON.stringify(newPost));
  Posts.insert(newPost, function(error, newPostId){
    if (error) {
      console.log("inset error: " + error);
      var result = {
        result: false,
        error: error.reason
      };
      response.write(JSON.stringify(result));
    }
    else{
      var result = {
        result: true,
        postId: newPostId
      };
      console.log("insert done");
      AddPostCount(userId);
      response.write(JSON.stringify(result));
    }
    response.end();
  })
}

UpVotePost = function(postId, userId, response){

  console.log("upvote post:"+postId + " :" + userId);
  if(!postId || !userId){
    result = {
        result: false,
        error: "params error"
      };
    response.write(JSON.stringify(result));
    response.end();
    return;
  }

  Posts.update({_id: postId}, {$inc: {upvotes: 1}, $push: {upvoters: userId}} , function(error, numOfDocAffected){
    
    var result;
    if(error){
      result = {
        result: false,
        error: error
      };
    }
    else{
      result = {
        result: true,
        numOfDocAffected: numOfDocAffected
      };
    }
    response.write(JSON.stringify(result));
    response.end();
  });
}

DownVotePost = function(postId, userId, response){

  if(!postId || !userId){
    result = {
        result: false,
        error: "params error"
      };
    response.write(JSON.stringify(result));
    response.end();
    return;
  }

  Posts.update({_id: postId}, {$inc: {downvotes: 1}} , function(error, numOfDocAffected){
    
    var result;
    if(error){
      result = {
        result: false,
        error: error
      };
    }
    else{
      result = {
        result: true,
        numOfDocAffected: numOfDocAffected
      };
    }
    response.write(JSON.stringify(result));
    response.end();
  });
}

UpdatePost = function(postId, newBody, response){
  Posts.update({_id: postId}, {body: newBody, postedAt: new Date()}, function(error, numOfFileAffected){
    var result;
    if(error){
      result = {
        result: false,
        error: error
      };
    }
    else{
      result = {
        result: true,
        numOfDocAffected: numOfDocAffected
      };
    }
    response.write(JSON.stringify(result));
    response.end();
  })
}
