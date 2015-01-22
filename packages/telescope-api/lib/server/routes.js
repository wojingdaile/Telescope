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
          var newPost = {
              author : this.request.body.author,
              baseScore : this.request.body.baseScore,
              body : this.request.body.body,
              clickCount : this.request.body.clickCount,
              commentCount : this.request.body.commentCount,
              commenters : this.request.body.commenters,
              createdAt : this.request.body.createdAt,
              downvotes : this.request.body.downvotes,
              htmlBody : this.request.body.htmlBody,
              inactive : this.request.body.inactive,
              lastCommentedAt : this.request.body.lastCommentedAt,
              postedAt : this.request.body.postedAt,
              score : this.request.body.score,
              status : this.request.body.status,
              sticky : this.request.body.sticky,
              title : this.request.body.title,
              upvoters : this.request.body.upvoters,
              upvotes : this.request.body.upvotes,
              userId : this.request.body.userId,
              viewCount : this.request.body.viewCountÏ
          };
          AddPost(newPost, this.response);
          break;
        }
        case "DELETE":{
          var deletePostId = this.params.query.postid;
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
          var post_id = this.params.query.post_id;
          var comment_id = this.params.query.comment_id;
          var limit = parseInt(this.params.query.limit);
          var skip = parseInt(this.params.query.skip);
          this.response.write(GetComments(post_id, comment_id, limit, skip));
          this.response.end();
          break;
        }
        case "POST":{
          // post new comment to a comment
          var author = this.request.body["author"];
          var baseScore = this.request.body["baseScore"];
          var body = this.request.body["body"];
          var createdAt = this.request.body["createdAt"];
          var downvotes = parseInt(this.request.body["downvotes"]);
          var htmlBody = this.request.body["htmlBody"];
          var author = this.request.body["inactive"];
          var postId = this.request.body["postId"];
          var postedAt = this.request.body["postedAt"];
          var score = this.request.body["score"];
          var upvoters = this.request.body["upvoters"];
          var upvotes = parseInt(this.request.body["upvotes"]);
          var userId = this.request.body["userId"];

          var newComment = {
            author: author,
            baseScore: baseScore,
            body: body,
            createdAt: createdAt,
            downvotes: downvotes,
            htmlBody: htmlBody,
            author: author,
            postId: postId,
            postedAt: postedAt,
            score: score,
            upvoters: upvoters,
            upvotes: upvotes,
            userId: userId
          };

          AddComment(newComment, this.response);

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
