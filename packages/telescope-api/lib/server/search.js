SearchPost = function (limit, searchQuery) {
  var terms = {
    limit: limit,
    query: searchQuery
  };

  var posts = [];
  var parameters = getPostsParameters(terms);
  parameters.find.$or = [
    {title: {$options: "i", $regex: searchQuery}},
    {url: {$options: "i", $regex: searchQuery}}
  ];
  
  Posts.find(parameters.find, parameters.options).forEach(function (post){
    var url = getPostLink(post);
    var properties = {
      title: post.title,
      headline: post.title, // for backwards compatibility
      author: post.author,
      date: post.postedAt,
      url: url,
      guid: post._id,
      attachments: post.attachment,
      upvotes:post.upvoters.length
    };

    if(post.body)
      properties.body = post.body;

    if(post.url)
      properties.domain = getDomain(url);

    if(twitterName = getTwitterNameById(post.userId))
      properties.twitterName = twitterName;

    posts.push(properties);
  });

  return posts;
};
