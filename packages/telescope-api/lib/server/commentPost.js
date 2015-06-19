GetPostCommentFromJsonString = function(jsonString){

  var userId = jsonString["userId"];
  var parseId;
  if(userId == undefined){
    var result = {
      result: false,
      error: "userId not found"
    };
    return result;
  }
  else{
    var user = Meteor.users.findOne({_id: userId});
    if(user == undefined){
        var result = {
          result: false,
          error: "user not found"
        };
        return result;
    }
  }
  parseId = user.parseId;
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
       inactive: true,
       parseId: parseId
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

  // temporarily spam filter with RegEx, should be replaced with DFA
  var text = newComment.body || "";
  if (text.toLowerCase().match(badWordsReg)) {
      var result = {
          result: false,
          error: "Be polite and no cursing"
        };
        response.write(JSON.stringify(result));
        response.end();
        return;
  }

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
      var postId = newComment.postId;
      Posts.update({_id: postId},{$inc: {commentCount: 1}});
			response.write(JSON.stringify(res));
		}
		response.end()
	});
}
