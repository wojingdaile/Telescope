Meteor.startup(function () {

  Router.route('categories', {
    where: 'server',
    path: '/api/categories/:limit?',
    action: function() {
      var limit = parseInt(this.params.limit);
      this.response.write(GetCategories(limit));
      this.response.end();
    }
  });

  Router.route('posts', {
    where: 'server',
    path: '/api/category/:category?/posts/:limit?',
    action: function() {
      var limit = parseInt(this.params.limit);
      var category = this.params.category;
      this.response.write(GetCategoryPosts(category, limit));
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
