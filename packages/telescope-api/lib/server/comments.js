GetCommentFromJsonString = function(jsonString){

  var parentId = jsonString["parentCommentId"];
  if (!parentId) {
    result = {
      result: false,
      error: "property not found: parentCommentId"
    };
    return result;
  }
  var parentComment = Comments.findOne({_id: parentId});
  if (!parentComment) {
    result = {
      result: false,
      error: "NO parent comment found"
    };
    return result;
  };
  var parentLevel = parentComment.level;
  var providePostProperties = ['author', 'body', 'htmlBody', 'inactive', 'postId', 'userId', 'parentCommentId'];
  var defaultComment = {
       baseScore: 0,
       createdAt: new Date(), 
       downvotes: 0, 
       postedAt: new Date(), 
       score: 0, 
       upvoters: [],
       upvotes: 0, 
       level: 1 + parentLevel
  };

  var newComment = defaultComment;
  var res = true;
  var missingProperty;
  for(i in providePostProperties){
    
    var property = providePostProperties[i];
    if(jsonString[property] == undefined){
        missingProperty =property;
        result = false;
        break;
    }
    else{
        newComment[property] = jsonString[property];
    }
  }
  var result;
  if(!res){
    result = {
      result: false,
      error: "property not found: " + missingProperty
    };
  }
  else{
    result = {
      result: true,
      comment: newComment
    };
  }
  return result;
};

Array.prototype.move = function (old_index, new_index) {

    if (new_index >= this.length) {
        var k = new_index - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
    return this; 
};

GetComments = function(post_id, comment_id, limit, skip){

	var comments = [];
	limit = typeof limit === 'undefined' ? 20 : limit;
	skip  = typeof skip === 'undefined' ? 0 : skip;

	if(post_id){

		Comments.find({postId: post_id}, {sort: {postedAt: 1}, limit: limit}).forEach(function(comment) {
      comments.push(comment);
    });

    for(var i = 0 ; i < comments.length; i++){
      
      var comment = comments[i];
      var insertIndex = i;
      comments.filter(function(subComment){
        return subComment.parentCommentId === comment._id
      }).forEach(function(subComment){
        insertIndex++;
        var subIndex = comments.indexOf(subComment);
        if(subIndex != insertIndex){
          comments.move(subIndex, insertIndex);
        }
      });
    }
	}
  var res = {
    comments: comments
  };
	return JSON.stringify(res);
		
};

AddComment = function(newComment, response){

  var userId = newComment.userId;
  if(!userId){
    var result = {
        result: false,
        error: "comment must has a userId"
      };
      response.write(JSON.stringify(result));
      response.end();
      return;
  }

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
      AddCommentCount(userId);
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


UpVoteComment = function(commentId, userId, response){

  if(!commentId || !userId){
    result = {
        result: false,
        error: "params error"
      };
    response.write(JSON.stringify(result));
    response.end();
    return;
  }

  Comments.update({_id: commentId}, {$inc: {upvotes: 1}, $push: {upvoters: userId}}, function(error, numOfDocAffected){
    
    var result;
    if(error){
      result = {
        result: false,
        error: error
      };
    }
    else{
      result = {
        result: true,
        numOfDocAffected: numOfDocAffected
      };
    }
    response.write(JSON.stringify(result));
    response.end();
  });
}

DownVoteComment = function(commentId, userId, response){

  if(!commentId || !userId){
    result = {
        result: false,
        error: "params error"
      };
    response.write(JSON.stringify(result));
    response.end();
    return;
  }

  Comments.update({_id: commentId}, {$inc: {downvotes: 1}} , function(error, numOfDocAffected){
    
    var result;
    if(error){
      result = {
        result: false,
        error: error
      };
    }
    else{
      result = {
        result: true,
        numOfDocAffected: numOfDocAffected
      };
    }
    response.write(JSON.stringify(result));
    response.end();
  });
}