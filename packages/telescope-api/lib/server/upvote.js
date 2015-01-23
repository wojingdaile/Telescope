UpVotePost = function(postId, response){

	Posts.update({_id: postId}, {$inc: {upvotes: 1}})
}

UpVoteComment = function(commentId, response){

}
