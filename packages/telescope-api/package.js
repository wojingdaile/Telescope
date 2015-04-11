Package.describe({summary: "Telescope API package"});

Package.onUse(function (api) {

  api.use(['telescope-lib', 'telescope-base'], ['server']);

  api.add_files(['lib/server/api.js',
                 'lib/server/routes.js',
                 'lib/server/categories.js',
                 'lib/server/posts.js',
                 'lib/server/comments.js',
                 'lib/server/commentPost.js',
                 'lib/server/user.js',
                 'lib/server/search.js',
                 'lib/server/avatar.js',
                 'lib/server/checkUsername.js',
                 'lib/components/scoring.js',
                 'lib/components/vote.js'], ['server']);

  api.export(['serveAPI']);

});
