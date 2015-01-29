Meteor.startup(function () {

  Router.route('categories', {
    where: 'server',
    path: '/api/categories/',
    action: function() {

      var method = this.request.method;
      this.response.writeHead(200, {"Content-Type": "text/json"});
      switch(method){
        case "GET":{
          var limit = parseInt(this.params.query.limit);
          this.response.write(GetCategories(limit));
          this.response.end();
          break;
        }
        case "POST":{
          var newCategory = this.request.body;
          AddCategory(newCategory, this.response);
          break;
        }
        case "DELETE":{
          var postid = this.params.query.categoryId;
          DeleteCategory(postid, this.response);
          break;
        }
        default:{
          this.response.end();
        }
      }
    }
  });

  Router.route('posts', {
    where: 'server',
    path: '/api/posts/',
    action: function() {

      var method = this.request.method;
      this.response.writeHead(200, {"Content-Type": "text/json"});
      switch(method){
        case "GET":{
          var category = this.params.query.category;
          var limit = parseInt(this.params.query.limit);
          var skip = parseInt(this.params.query.skip);

          this.response.write(GetCategoryPosts(category, limit, skip));
          this.response.end();
          break;
        }
        case "POST":{
          var result = GetPostFromJsonString(this.request.body);
          if(!result.result){
            this.response.write(JSON.stringify(result));
            this.response.end();
          }
          else{
            AddPost(result.post, this.response);
          }
          break;
        }
        case "DELETE":{
          var deletePostId = this.params.query.postId;
          DeletePost(deletePostId, this.response);
          break;
        }
        case "PUT":{
          var action = this.params.query.action;
          var postId = this.request.body.postId;
          if("addPostClickCount" == action){
            AddPostClickCount(postId, this.response)
          }
          else if("updatePost" == action){
            var newBody = this.request.body.body;
            UpdatePost(postId, newBody, this.response);
          }
          else if("upvote" == action){
            var userId = this.request.body.userId;
            UpVotePost(postId, userId, this.response);
          }
          else if("downvote" == action){
            var userId = this.request.body.userId;
            DownVotePost(postId, userId, this.response);
          }
          else{
            this.response.statusCode = 400;
            var result = {
              result: false,
              error: "action not support"
            };
            this.response.write(JSON.stringify(result));
            this.response.end();
          }
          break;
        }
      }
    }
  });

  Router.route('comments', {
    where: 'server',
    path: '/api/comments/',
    action: function(){
      
      var method = this.request.method;
      this.response.writeHead(200, {"Content-Type": "text/json"});
      switch(method){

        case "GET":{
          // get comments
          var post_id = this.params.query.postId;
          var comment_id = this.params.query.commentId;
          var limit = parseInt(this.params.query.limit);
          var skip = parseInt(this.params.query.skip);
          this.response.write(GetComments(post_id, comment_id, limit, skip));
          this.response.end();
          break;
        }
        case "POST":{
          // post new comment to a comment
          var result = GetCommentFromJsonString(this.request.body);
          if(!result.result){
            this.response.write(JSON.stringify(result));
            this.response.end();
          }
          else{
            AddComment(result.comment, this.response);
          }
          break;
        }
        case "DELETE":{
          // delete comment
          var comment_id = this.params.query.commentId;
          DeleteComment(comment_id, this.response);
          break;
        }
        case "PUT":{
          var action = this.params.query.action;
          var commentId = this.request.body.commentId;
          if("upvote" == action){
            var userId = this.request.body.userId;
            UpVoteComment(commentId, userId, this.response);
          }
          else if("downvote" == action){
            var userId = this.request.body.userId;
            DownVoteComment(commentId, userId, this.response);
          }
          else{
            this.response.statusCode = 400;
            var result = {
              result: false,
              error: "action not support"
            };
            this.response.write(JSON.stringify(result));
            this.response.end();
          }
          break;
        }
      }
    }
  });

  Router.route('commentPost',{
    where: 'server',
    path: '/api/commentPost',
    action: function(){

      this.response.writeHead(200, {"Content-Type": "text/json"});
      var result = GetPostCommentFromJsonString(this.request.body);
      if(!result.result){
        this.response.write(JSON.stringify(result));
        this.response.end();
      }
      else{
        AddPostComment(result.comment, this.response);
      }
    }
  });

  Router.route('users', {
    where: 'server',
    path: '/api/user',
    action: function() {
      var parseId = this.request.headers['x-auth-token'];
      if (this.request.method == 'GET') {
        if (parseId == undefined) {
          this.response.statusCode = 400;
          var result = JSON.stringify({
            "error": "X-Auth-Token invalid."
          })
          this.response.write(result);
          this.response.end();
          return;
        }

        this.response.write(GetUser(parseId));
        this.response.end();
      } else if (this.request.method == 'POST') {
        var userInfo = this.request.body;

        if (userInfo == undefined || Object.keys(userInfo).length == 0) {
          CreateUser(userInfo, this.response);
        }
      } else if (this.request.method == 'PUT') {
        this.response.statusCode = 400;
        var result = JSON.stringify({
          "error": "method not implemented."
        })
        this.response.write(result);
        this.response.end();
      } else {
        this.response.statusCode = 400;
        var result = JSON.stringify({
          "error": "method not allowed."
        })
        this.response.write(result);
        this.response.end();
      }
    }
  });
});
