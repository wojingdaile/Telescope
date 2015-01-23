Package.describe({summary: "Telescope API package"});

Package.onUse(function (api) {

  api.use(['telescope-base', 'telescope-lib'], ['server']);

  api.add_files(['lib/server/api.js', 'lib/server/routes.js', 'lib/server/categories.js', 'lib/server/posts.js', 'lib/server/comments.js', 'lib/server/commentPost.js', 'lib/server/upvote.js', 'lib/server/downvote.js'],['server']);

  api.export(['serveAPI']);

});
