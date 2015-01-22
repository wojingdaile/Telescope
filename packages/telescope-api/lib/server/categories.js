GetCategories = function(limitSegment){
  var categories = [];
  var limit = typeof limitSegment === 'undefined' ? 20 : limitSegment // default limit: 20 posts

  Categories.find({}, {sort: {order: 1, name: 1}, limit: limit}).forEach(function (category) {
    categories.push(category);
  });

  var res = {
  	categories: categories
  };
  return JSON.stringify(res);
};

AddCategory = function(newCategory,response){

	Categories.insert(newCategory,function callback(error, categoryId){
		if (error) {
			var result = {
				result: false,
				error: error
			};
			response.write(JSON.stringify(result));
		}
		else{
			var result = {
				result: true,
				categoryId: categoryId
			};
			response.write(JSON.stringify(result));
		}
		response.end();
	});
};

DeleteCategory = function(deleteCategoryId, response){

	var deleteCategory = Categories.findOne({_id: deleteCategoryId});
	
	if(deleteCategory){
		Categories.remove(deleteCategory , function callBack(error){
			if (error) {
				var result = {
					result: false,
					error: error
				};
				response.write(JSON.stringify(result));
				response.end();
			}
			else{
				var result = {
					result: true
				};
				response.write(JSON.stringify(result));
				response.end();
			}
		});
	}
	else{
		var result = {
					result: false,
					reson: "category not fonud"
				};
				response.write(JSON.stringify(result));
				response.end();
	}
}
