GetPostCommentFromJsonString = function(jsonString){

  var providePostProperties = ['author', 'body', 'htmlBody', 'inactive', 'postId', 'userId'];
  var defaultComment = {
       baseScore: 0,
       createdAt: new Date(), 
       downvotes: 0, 
       postedAt: new Date(), 
       score: 0, 
       upvoters: [],
       upvotes: 0, 
  };

    var newComment = defaultComment;
    var result;
    for(i in providePostProperties){
      
      var property = providePostProperties[i];
      if(jsonString[property] == undefined){

          result = {
          result: false,
          error: "property not found: " + property
        };
          break;
      }
      else{
          newComment[property] = jsonString[property];
          result = {
            result: true,
            comment: newComment
          };
      }
    }
    return result;
};

AddPostComment= function(newComment, response){
	Comments.insert(newComment, function(error, commentId) {
		if (error) {
			var res = {
				result: false,
				error: error
			};
			response.write(JSON.stringify(res));
		}
		else{
			var res = {
				result: true,
				commentId: commentId
			};
			response.write(JSON.stringify(res));
		}
		response.end()
	});
}