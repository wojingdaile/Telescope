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
          AddPost(this.request.body, this.response);
          break;
        }
        case "DELETE":{
          var deletePostId = this.params.query.postId;
          DeletePost(deletePostId, this.response);
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
          AddComment(this.request.body, this.response);

          break;
        }
        case "DELETE":{
          // delete comment
          var comment_id = this.params.query.commentId;
          DeleteComment(comment_id, this.response);
          break;
        }
      }
      
    }
  });
});
