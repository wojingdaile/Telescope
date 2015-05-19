GetShowOffCommentFromJsonString = function(jsonString) {

  console.log("get showoffcomment from json string: " + JSON.stringify(jsonString));
  var userId = jsonString["authorId"];
  console.log("get userid from json string : " + userId);
  var parseId;
  if(userId == undefined){
    result = {
      result: false,
      error: "property not found: userId"
    };
    return result;
  }
  else{
    var user =  Meteor.users.findOne({_id: userId});
    if(user == undefined){
      result = {
        result: false,
        error: "user not found"
      };
      return result;
    }
    else{
      parseId = user.parseId;
    }
  }

  var parentId = jsonString["parentId"];
  if (!parentId) {
    return;
  };
  var isParentPost = jsonString["isRootComment"];
  var parentLevel = 0;
  if (!isParentPost) {
    var parentComment = ShowoffComments.findOne({_id: parentId});
    parentLevel = parentComment.level;
  };

  var providePostCommentProperties = ['authorId', 'commentContent', 'parentId', 'showOffId'];
  var defaultShowOffComment = {
    createdAt: new Date(),
    postedAt: new Date(),
    downvoters: [],
    downvotes: 0,
    upvoters: [],
    upvotes: 0,
    inactive: true,
    level: 1 + parentLevel,
    userId: userId,
    parseId: parseId,
    isRootComment: isParentPost ? true: false
  };

  var newShowOffComment = defaultShowOffComment;
  var res = true;
  var missingProperty;
  providePostCommentProperties.forEach(function(property) {
    
      newShowOffComment[property] = jsonString[property];
  });

  var result;
  if (!res) {
    result = {
      result: false,
      error: "property is not found: " + missingProperty
    };
  } else {
    result = {
      result: true,
      newShowOffComment: newShowOffComment
    };
  }
  return result;
};

uploadShowOffComment = function(newShowOffComment, response) {

  console.log("new showoff comment :" + newShowOffComment)
  var userId = newShowOffComment.userId;
  var showOffId = newShowOffComment.showOffId;
  var showOffItem = Showoffs.findOne({
    _id: showOffId
  });

  if (!showOffItem) {
    var result = {
      result: false,
      error: "no showoff found"
    };
    response.write(JSON.stringify(result));
    response.end();
  };

  var numberOfComments = showOffItem.commentConut + 1;
  console.log("update comment number :" + numberOfComments);
    Showoffs.update({
      _id: showOffId
    }, 
    {
      $set:{commentConut: numberOfComments},
    }, function(error) {
      var result;
      if (error) {
        result = {
          result: false,
          error: error
        };

        response.write(JSON.stringify(result));
        response.end();
      }   
    })

  ShowoffComments.insert(newShowOffComment, function(error, newShowOffCommentID) {
    if (error) {
      var result = {
        result: false,
        error: error.reason
      };
      response.write(JSON.stringify(result));
    } else {
      var result = {
        result: true,
        newShowOffCommentID: newShowOffCommentID
      };
      response.write(JSON.stringify(result));
    }
    response.end();
  })
};

GetShowOffComments = function(showOffId, userId, limitSegment, skip) {
  var showOffComments = [];
  var limit = typeof limitSegment === 'undefined' ? 20 : limitSegment // default limit: 20 showoffs
  skip = typeof skip === 'undefined' ? 0 : skip;
  console.log("will get showoff comments  "  + " limit " + limit + " skip " + skip + " showOffId  " + showOffId + " userId " + userId);

    if(showOffId){
      ShowoffComments.find({showOffId: showOffId}, {sort: {postedAt: 1}, limit: limit,skip: skip}).forEach(function(showOffCommentItem) {
      showOffCommentItem["hasUpvoted"] = showOffCommentItem.upvoters != undefined ? (showOffCommentItem.upvoters.contains(userId)? true: false) : false;
      showOffCommentItem["hasDownVoted"] = showOffCommentItem.downvoters != undefined ? (showOffCommentItem.downvoters.contains(userId)? true: false) : false;
      showOffCommentItem["commentId"] = showOffCommentItem._id;

      if(showOffCommentItem.authorId != undefined){
        var user = Meteor.users.findOne({_id: showOffCommentItem.authorId});
        if (user != undefined) {
          showOffCommentItem["authorFaceURL"] = user.avatar;
          showOffCommentItem["authorName"] = user.username;
        }
        else{
          showOffCommentItem["authorFaceURL"] = "";
        }
      }

      if(showOffCommentItem["level"] == undefined){
        showOffCommentItem["level"] = 1;
      }
      delete showOffCommentItem.upvoters;
      delete showOffCommentItem.downvoters;
      showOffComments.push(showOffCommentItem);
    });

    for(var i = 0 ; i < showOffComments.length; i++){

      var comment = showOffComments[i];
      var insertIndex = i;
      showOffComments.filter(function(subComment){
        return subComment.parentId === comment._id
      }).forEach(function(subComment){
        insertIndex++;
        var subIndex = showOffComments.indexOf(subComment);
        if(subIndex != insertIndex){
          showOffComments.move(subIndex, insertIndex);
        }
      });
    }
  }
  var res = {
    showOffComments: showOffComments
  };
  return JSON.stringify(res);
};

LikeShowOffComment = function(commentId, userId, response) {

  if (!commentId || !userId) {
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
  var commentItem = ShowoffComments.findOne({
    _id: commentId
  });

  if (user && commentItem) {
    //unhate
    var haters = commentItem.downvoters;
    var hates = commentItem.downvotes;
    var hasHated = false;
    var hateIndex;
    for (var i = haters.length - 1; i >= 0; i--) {
      if (haters[i] == userId) {

        hasHated = true;
        hateIndex = i;
      };
    };

    if (hasHated) {
      hates --;
      haters.splice(hateIndex,1);

      ShowoffComments.update({
        _id: commentId
      },
      {
        $set:{downvoter: hates,downvoters: haters},
      }, function(error) {});
    };

    //like
    var likers = commentItem.upvoters;
    var likes = commentItem.upvotes;
    for (var i = likers.length - 1; i >= 0; i--) {
      if (likers[i] == userId) {

          response.write(JSON.stringify({
            result: false,
            error: "upVoted before"
          }));
          response.end();
      };
    };

    likes ++;
    likers.push(userId);

    ShowoffComments.update({
      _id: commentId
    }, 
    {
      $set:{upvotes: likes,upvoters: likers},
    }, function(error) {
      var result;
      if (error) {
        result = {
          result: false,
          error: error
        };
      } else {
        result = {
          result: true
        };
      }
      response.write(JSON.stringify(result));
      response.end();
    })

  }
  else{
    response.write(JSON.stringify({
      result: false,
      error: "wrong params"
    }));
    response.end();
  };
}



UnLikeShowOffComment = function(commentId, userId, response) {

  if (!commentId || !userId) {
    result = {
      result: false,
      error: "params error"
    };
    response.write(JSON.stringify(result));
    response.end();
    return;
  }

  console.log("will unlike showoff comment");

  var user = Meteor.users.findOne({
    _id: userId
  });
  var commentItem = ShowoffComments.findOne({
    _id: commentId
  });

  if (user && commentItem) {
    var likers = commentItem.upvoters;
    var likes = commentItem.upvotes;
    var hasLiked = false;
    var likeIndex;
    console.log("likers :" + likers);
    for (var i = likers.length - 1; i >= 0; i--) {
      console.log("liker :" + likers[i] + ",user :" + userId);
      if (likers[i] == userId) {

        hasLiked = true;
        likeIndex = i;
      };
    };

    if (!hasLiked) {
      response.write(JSON.stringify({
        result: false,
        error: "have not upVoted before"
      }));
      response.end();
    };
    likes --;
    likers.splice(likeIndex,1);

    ShowoffComments.update({
      _id: commentId
    },
    {
      $set:{upvotes: likes,upvoters: likers},
    }, function(error) {
      var result;
      if (error) {
        result = {
          result: false,
          error: error
        };
      } else {
        result = {
          result: true
        };
      }
      response.write(JSON.stringify(result));
      response.end();
    })
  }
  else{
    response.write(JSON.stringify({
      result: false,
      error: "wrong params"
    }));
    response.end();
  };
}

HateShowOffComment = function(commentId, userId, response) {

  if (!commentId || !userId) {
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
  var commentItem = ShowoffComments.findOne({
    _id: commentId
  });

  if (user && commentItem) {
    //unlike
    var likers = commentItem.upvoters;
    var likes = commentItem.upvotes;
    var hasLiked = false;
    var likeIndex;
    console.log("likers :" + likers);
    for (var i = likers.length - 1; i >= 0; i--) {
      console.log("liker :" + likers[i] + ",user :" + userId);
      if (likers[i] == userId) {

        hasLiked = true;
        likeIndex = i;
      };
    };

    if (hasLiked) {
      likes --;
      likers.splice(likeIndex,1);

      ShowoffComments.update({
        _id: commentId
      },
      {
        $set:{upvotes: likes,upvoters: likers},
      }, function(error) {});
    };

    //hate
    var haters = commentItem.downvoters;
    var hates = commentItem.downvotes;
    for (var i = haters.length - 1; i >= 0; i--) {
      if (haters[i] == userId) {

          response.write(JSON.stringify({
            result: false,
            error: "downVoted before"
          }));
          response.end();
      };
    };

    hates ++;
    haters.push(userId);

    ShowoffComments.update({
      _id: commentId
    }, 
    {
      $set:{downvotes: hates,downvoters: haters},
    }, function(error) {
      var result;
      if (error) {
        result = {
          result: false,
          error: error
        };
      } else {
        result = {
          result: true
        };
      }
      response.write(JSON.stringify(result));
      response.end();
    })

  }
  else{
    response.write(JSON.stringify({
      result: false,
      error: "wrong params"
    }));
    response.end();
  };
}

UnHateOffComment = function(commentId, userId, response) {

  if (!commentId || !userId) {
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
  var commentItem = ShowoffComments.findOne({
    _id: commentId
  });

  if (user && commentItem) {
    var haters = commentItem.downvoters;
    var hates = commentItem.downvotes;
    var hasHated = false;
    var hateIndex;
    for (var i = haters.length - 1; i >= 0; i--) {
      if (haters[i] == userId) {

        hasHated = true;
        hateIndex = i;
      };
    };

    if (!hasHated) {
      response.write(JSON.stringify({
        result: false,
        error: "have not upVoted before"
      }));
      response.end();
    };
    hates --;
    haters.splice(hateIndex,1);


    ShowoffComments.update({
      _id: commentId
    },
    {
      $set:{downvoter: hates,downvoters: haters},
    }, function(error) {
      var result;
      if (error) {
        result = {
          result: false,
          error: error
        };
      } else {
        result = {
          result: true
        };
      }
      response.write(JSON.stringify(result));
      response.end();
    })
  }
  else{
    response.write(JSON.stringify({
      result: false,
      error: "wrong params"
    }));
    response.end();
  };
}

DeleteOffComment  = function(commentId, userId, response) {
  if (!commentId || !userId) {
    result = {
      result: false,
      error: "params error"
    };
    response.write(JSON.stringify(result));
    response.end();
    return;
  }

    var deleteComment = ShowoffComments.findOne({_id: commentId});
    if(deleteComment){

      ShowoffComments.remove(deleteComment, function(error){
        if (error) {
          var result = {
            result: false,
            error: error
          };
          response.write(JSON.stringify(result));
          response.end();
        }
        else{

          Showoffs.update({_id: deleteComment.showOffId},{$inc: {commentCount: -1}});
          //DeleleSubComments(commentId);
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
        reson: "showoffcomment not found"
      };
      response.write(JSON.stringify(result));
      response.end();
    }
}

DeleleSubComments = function(commentId){
  console.log("delete: " + commentId);
  ShowoffComments.find({parentId: commentId}).forEach(function(subComment){
            ShowoffComments.remove(subComment,function(error){
              if(!error){
                Showoffs.update({_id: subComment.showOffId},{$inc: {commentCount: -1}});
              }
            });
            DeleleSubComments(subComment._id);
  });
}