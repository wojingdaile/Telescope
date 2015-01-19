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

	return JSON.stringify(comments);
		
};