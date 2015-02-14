GetPostCommentFromJsonString = function(jsonString){

  var providePostProperties = ['author', 'body', 'htmlBody', 'postId', 'userId'];
  var defaultComment = {
       baseScore: 0,
       createdAt: new Date(), 
       downvotes: 0, 
       postedAt: new Date(), 
       score: 0, 
       upvoters: [],
       upvotes: 0, 
       level: 1,
       inactive: true
  };

    var newComment = defaultComment;
    var result;

    providePostProperties.forEach(function(property){

      if(jsonString[property] == undefined){

          result = {
          result: false,
          error: "property not found: " + property
        };
          return;
      }
      else{
          newComment[property] = jsonString[property];
          result = {
            result: true,
            comment: newComment
          };
      }
    });
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