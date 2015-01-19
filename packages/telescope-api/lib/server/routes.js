Meteor.startup(function () {

  Router.route('api', {
    where: 'server',
    path: '/api/:limit?',
    action: function() {
      var limit = parseInt(this.params.limit);
      this.response.write(serveAPI(limit));
      this.response.end();
    }
  });

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

});
