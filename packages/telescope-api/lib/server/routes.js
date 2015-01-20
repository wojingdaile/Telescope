Meteor.startup(function () {

  Router.route('categories', {
    where: 'server',
    path: '/api/categories/',
    action: function() {

      var method = this.request.method;
      switch(method){
        case "GET":{
          var limit = parseInt(this.params.query.limit);
          this.response.write(GetCategories(limit));
          this.response.end();
          break;
        }
        case "POST":{
          var name = this.request.body["name"];
          var description = this.request.body["description"];
          var order = parseInt(this.request.body["order"]);
          var slug = this.request.body["slug"];
          var newCategory = {
            name: name,
            description: description,
            order: order,
            slug: slug
          };
          AddCategory(newCategory, this.response);
          break;
        }
        case "DELETE":{
          var postid = this.params.query.categoryId;
          console.log('delete ' + postid);
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

      var category = this.params.query.category;
      var limit = parseInt(this.params.query.limit);
      var skip = parseInt(this.params.query.skip);

      this.response.write(GetCategoryPosts(category, limit, skip));
      this.response.end();
    }
  });

  Router.route('comments', {
    where: 'server',
    path: '/api/comments/',
    action: function(){
  
      var post_id = this.params.query.post_id;
      var comment_id = this.params.query.comment_id;
      var limit = parseInt(this.params.query.limit);
      var skip = parseInt(this.params.query.skip);
      this.response.write(GetComments(post_id, comment_id, limit, skip));
      this.response.end();
    }
  });
});
