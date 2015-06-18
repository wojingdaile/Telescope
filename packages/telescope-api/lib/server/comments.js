GetCommentFromJsonString = function(jsonString){

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
  var parentLevel = parentComment.level == undefined? 1: parentComment.level;
  console.log("parent level " + parentLevel);
  var providePostProperties = ['author', 'body', 'htmlBody', 'postId', 'userId', 'parentCommentId'];
  var defaultComment = {
       baseScore: 0,
       createdAt: new Date(),
       downvotes: 0,
       postedAt: new Date(),
       score: 0,
       upvoters: [],
       upvotes: 0,
       inactive: true,
       level: 1 + parentLevel,
       parseId: parseId
  };

  var newComment = defaultComment;
  var parasValid = true;
  var missingProperty;

  providePostProperties.forEach(function(property){

    if(jsonString[property] == undefined){
        missingProperty =property;
        parasValid = false;
        return;
    }
    else{
        newComment[property] = jsonString[property];
    }
  });
  console.log("new comment :" + JSON.stringify(newComment));
  var result;
  if(!parasValid){
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

GetComments = function(post_id, userId, limit, skip){

	var comments = [];
	limit = typeof limit === 'undefined' ? 20 : limit;
	skip  = typeof skip === 'undefined' ? 0 : skip;

	if(post_id){
		Comments.find({postId: post_id}, {sort: {postedAt: 1}, limit: limit,skip: skip}).forEach(function(comment) {
      comment["upvoted"] = comment.upvoters.contains(userId);
      comment["downvoted"] = comment.downvoters != undefined ? (comment.downvoters.contains(userId)? true: false) : false;

      if(comment.userId != undefined){
      var user = Meteor.users.findOne({_id: comment.userId});
      if (user != undefined) {
          comment["avatar"] = user.avatar;
          comment["isAuthorVIP"] = user.isVIP;
      }
      else{
          comment["avatar"] = "";
          comment["isAuthorVIP"] = false;
      }
    }

      if(comment["level"] == undefined){
        comment["level"] = 1;
      }
      delete comment.upvoters;
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

  // temporarily spam filter with RegEx, should be replaced with DFA
  var text = newComment.body || "";
  if (text.toLowerCase().match(/\b(ass|fuck|dick|sex|sexy|boob|naked|bitch)\b/g)) {
      var result = {
          result: false,
          error: "Be polite and no cursing"
        };
        response.write(JSON.stringify(result));
        response.end();
        return;
  }

  console.log("insert new comment: " + JSON.stringify(newComment));
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
      Posts.update({_id: newComment.postId},{$inc: {commentCount: 1}});
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
          Posts.update({_id: deleteComment.postId},{$inc: {commentCount: -1}});
          DeleleSubComments(comment_id);
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

DeleleSubComments = function(commentId){
  console.log("delete: " + commentId);
  Comments.find({parentCommentId: commentId}).forEach(function(subComment){
            Comments.remove(subComment,function(error){
              if(!error){
                Posts.update({_id: subComment.postId},{$inc: {commentCount: -1}});
              }
            });
            DeleleSubComments(subComment._id);
  });
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

  var user = Meteor.users.findOne({
    _id: userId
  });
  var item = Comments.findOne({
    _id: commentId
  });
  var result = upvoteItem(Comments, item, user);

  response.write(JSON.stringify({result: result}));
  response.end();
}

DeUpVoteComment = function(commentId, userId, response){

  if(!commentId || !userId){
    result = {
        result: false,
        error: "params error"
      };
    response.write(JSON.stringify(result));
    response.end();
    return;
  }

  var user = Meteor.users.findOne({
    _id: userId
  });
  var item = Comments.findOne({
    _id: commentId
  });
  var result = cancelUpvote(Comments, item, user);

  response.write(JSON.stringify({result: result}));
  response.end();
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

  var user = Meteor.users.findOne({
    _id: userId
  });
  var item = Comments.findOne({
    _id: commentId
  });
  var result = downvoteItem(Comments, item, user);

  response.write(JSON.stringify({result: result}));
  response.end();
}

DeDownVoteComment = function(commentId, userId, response){

  if(!commentId || !userId){
    result = {
        result: false,
        error: "params error"
      };
    response.write(JSON.stringify(result));
    response.end();
    return;
  }

  var user = Meteor.users.findOne({
    _id: userId
  });
  var item = Comments.findOne({
    _id: commentId
  });
  var result = cancelDownvote(Comments, item, user);

  response.write(JSON.stringify({result: result}));
  response.end();
}
