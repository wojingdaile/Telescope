UpVotePost = function(postId, response){
	//TODO: add user id to upvoters
	Posts.update({_id: postId}, {$inc: {upvotes: 1}} , function(error, numOfDocAffected){
		
		var result;
		if(error){
			result = {
				res: false,
				error: error
			};
		}
		else{
			result = {
				res: true,
				numOfDocAffected: numOfDocAffected
			};
		}
		response.write(JSON.stringify(result));
		response.end();
	});
}

UpVoteComment = function(commentId, response){
	//TODO: add user id to upvoters
	Comments.update({_id: commentId}, {$inc: {upvotes: 1}} , function(error, numOfDocAffected){
		
		var result;
		if(error){
			result = {
				res: false,
				error: error
			};
		}
		else{
			result = {
				res: true,
				numOfDocAffected: numOfDocAffected
			};
		}
		response.write(JSON.stringify(result));
		response.end();
	});
}
