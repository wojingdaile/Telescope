GetCategories = function(limitSegment){
  var categories = [];
  var limit = typeof limitSegment === 'undefined' ? 20 : limitSegment // default limit: 20 posts

  Categories.find({}, {sort: {order: 1, name: 1}, limit: limit}).forEach(function (category) {
    console.log('category: ', category);
    categories.push(category);
  });

  return JSON.stringify(categories);
};
