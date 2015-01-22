GetCategoryPosts = function(categorySegment, limitSegment, skip){
  var posts = [];
  var category = typeof limitSegment === 'undefined' ? 'top' : categorySegment;
  var limit = typeof limitSegment === 'undefined' ? 20 : limitSegment // default limit: 20 posts
  skip  = typeof skip === 'undefined' ? 0 : skip;
  console.log("+++++++++++: " + category);
  var post =  Posts.findOne();
  console.log("xxxxxx: " + post.categories + STATUS_APPROVED);

  Posts.find({categories: [category], status: STATUS_APPROVED}).forEach(function(post) {
    console.log("find a post " + post.name);
    var url = getPostLink(post);
    var properties = {
      title: post.title,
      headline: post.title, // for backwards compatibility
      author: post.author,
      date: post.postedAt,
      url: url,
      guid: post._id
    };

    if(post.body)
      properties.body = post.body;

      if(post.url)
        properties.domain = getDomain(url);

        if(twitterName = getTwitterNameById(post.userId))
          properties.twitterName = twitterName;

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

          posts.push(properties);
        });

        return JSON.stringify(posts);
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

  Posts.insert(newPost, function(error, newPostId){
    if (error) {
      var result = {
        result: false,
        error: error
      };
      response.write(JSON.stringify(result));
    }
    else{
      var result = {
        result: true,
        postId: newPostId
      };
      response.write(JSON.stringify(result));
    }
    response.end();
  })
}
