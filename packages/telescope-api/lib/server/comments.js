GetComments = function(post_id, comment_id, limit, skip){

	var comments = [];
	limit = typeof limit === 'undefined' ? 20 : limit;
	skip  = typeof skip === 'undefined' ? 0 : skip;

	if(post_id){

		Comments.find({postId: post_id}, {sort: {postedAt: -1}, limit: 50}).forEach(function(comment) {
            
            comments.push(comment);
          });

          var commentsToDelete = [];

          comments.forEach(function(comment, index) {
            if (comment.parentCommentId) {
              var parent = comments.filter(function(obj) {
                return obj._id === comment.parentCommentId;
              })[0];
              if (parent) {
                parent.replies = parent.replies || [];
                parent.replies.push(JSON.parse(JSON.stringify(comment)));
                commentsToDelete.push(index)
              }
            }
          });

          commentsToDelete.reverse().forEach(function(index) {
            comments.splice(index,1);
          });
	}
  var res = {
    comments: comments
  };
	return JSON.stringify(res);
		
};

AddComment = function(newComment, response){

  Comments.insert(newComment, function(error, commentId){

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
        commentId: commentId
      };
      response.write(JSON.stringify(result));
    }
    response.end();
  });
}

DeleteComment = function(comment_id, response){

  if(comment_id){

    var deleteComment = Comments.findOne({_id: comment_id});
    if(deleteComment){

      Comments.remove(deleteComment, function(error){
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
        reson: "comment not found"
      };
      response.write(JSON.stringify(result));
      response.end();
    }
  }
}