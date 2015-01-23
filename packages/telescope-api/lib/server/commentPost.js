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