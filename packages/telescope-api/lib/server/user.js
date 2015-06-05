
GetUser = function(parseId, reponse) {
  var user = Meteor.users.findOne({parseId: parseId})

  delete user.services;
  delete user.email_hash;

  return JSON.stringify(user);
}

DelUserInfo = function(parseId, response) {
  var deleteUser = Meteor.users.findOne({parseId: parseId});

  if (deleteUser) {
      console.log("id:", deleteUser._id)
      Posts.find({userId: deleteUser._id}).forEach(function(deletePost) {
        //console.log("deletePost:", deletePost)

        Posts.remove(deletePost, function(error) {
          if (error) {
            var result = {
              result: false,
              error: error
            };
            response.write(JSON.stringify(result));
            response.end();
          }
        });
      });

      Comments.find({userId: deleteUser._id}).forEach(function(deleteComment) {
        //console.log("deleteComment:", deleteComment)

        Comments.remove(deleteComment, function(error) {
          if (error) {
            var result = {
              result: false,
              error: error
            };
            response.write(JSON.stringify(result));
            response.end();
          }
        });
      });

      Showoffs.find({authorId: deleteUser._id}).forEach(function(deleteShowOff) {
        Showoffs.remove(deleteShowOff,function(error){
          if (error) {
            var result = {
              result: false,
              error: error
            };
            response.write(JSON.stringify(result));
            response.end();
          }
        });
      });

      ShowoffComments.find({authorId: deleteUser._id}).forEach(function(deleteShowOffComment) {
        ShowoffComments.remove(deleteShowOffComment,function(error){
          if (error) {
            var result = {
              result: false,
              error: error
            };
            response.write(JSON.stringify(result));
            response.end();
          }
        });
      });

      Meteor.users.remove(deleteUser, function(error) {
        if (error) {
          var result = {
            result: false,
            error: error
          };
          response.write(JSON.stringify(result));
          response.end();
        } else {
          var result = {
            result: true
          };
          response.write(JSON.stringify(result));
          response.end();
        }
      });

  } else {
      var result = {
        result: false,
        reson: "delete user not found"
      };
      response.write(JSON.stringify(result));
      response.end();
  }
}

CreateUser = function(userInfo, response) {

  var parseId = userInfo.parseId;
  var services = userInfo.services;
  var avatar = userInfo.avatar;
  var isVIP = userInfo.isVIP ? true : false;

  console.log("isvip :" + isVIP);
  var result;
  if (!parseId) {
     result = {
      result: false,
      error: "paras error."
     };
    response.statusCode = 400;
    response.write(JSON.stringify(result));
    response.end()
    return;
  }

  var username = userInfo.username;
  // var email = userInfo.email;

  // search if user exsited
  var user = Meteor.users.findOne({parseId: parseId});
  if (user == undefined) {
    try{
      var userId = Accounts.createUser({username: username});
    }
    catch(error){
      response.statusCode = error.error;
      result = {
          result: false,
          error: error.reason
        };
        response.write(JSON.stringify(result));
        response.end();
    }
      if (!userId) {
        response.statusCode = 500;
        result = {
          result: false,
          error: 'create user failed, sys err.'
        };
        response.write(JSON.stringify(result));
        response.end();
      } else {
        console.log("will save vip :" + isVIP);
        Meteor.users.update({_id: userId},{$set:{services: services, parseId: parseId, avatar: avatar, isVIP: isVIP}}, function(error, numOfFileAffected){
          if(error){
            response.statusCode = 500;
            result = {
              result: false,
              error: error
            };
            response.write(JSON.stringify(result));
            response.end();
          }
          else{
            response.statusCode = 200;
            result = {
            result: true,
            userId: userId,
            isVIP: isVIP
          };
          response.write(JSON.stringify(result));
          response.end();
          }
        });
      }
  } else {

    console.log("get user is vip :" + user.isVIP);
    if (!user.isVIP && isVIP) {
      Meteor.users.update({parseId: parseId},{$set: {"isVIP": isVIP}}, function (error, affected) {
      if (error) {
        result = JSON.stringify({
          "result": false,
          "error": "update vip failed."
        });
      }
      });
    }
    else{
      result = {
          result: true,
          userId: user._id,
          isAdmin: user.isAdmin,
          avatar: user.avatar,
          isVIP: user.isVIP
        };
    }

    response.statusCode = 400;
    response.write(JSON.stringify(result));
    response.end()
  }
}

UpdateUserName = function (parseId, newName, response) {
  var user = Meteor.users.findOne({parseId: parseId});

  if (!user) {
    var result = JSON.stringify({
      "error": "user not exist."
    });
    response.statusCode = 400;
    response.write(result);
    response.end()
    return;
  }

  Meteor.users.update({parseId: parseId},{$set: {"username": newName}}, function (error, affected) {
    if (error) {
      var result = JSON.stringify({
        "result": false,
        "error": "update user failed."
      });
      response.statusCode = 400;
      response.write(result);
      response.end()
      return;
    }


    var result = JSON.stringify({
      "result": true
    });
    response.write(result);
    response.end()
    return;
  });
}

UpdateUserAvatar = function(parseId, newAvatar, response){

  var user = Meteor.users.findOne({parseId: parseId});

  if (!user) {
    var result = JSON.stringify({
      "error": "user not exist."
    });
    response.statusCode = 400;
    response.write(result);
    response.end()
    return;
  }

  Meteor.users.update({parseId: parseId},{$set: {"avatar": newAvatar}}, function (error, affected) {
    if (error) {
      var result = JSON.stringify({
        "result": false,
        "error": "update user failed."
      });
      response.statusCode = 400;
      response.write(result);
      response.end()
      return;
    }


    var result = JSON.stringify({
      "result": true
    });
    response.write(result);
    response.end()
    return;
  });
}


AddCommentCount = function(userId){

  Meteor.users.update({_id: userId}, {$inc: {commentCount: 1}}, function(error, numOfFileAffected){
    if(error){
      console.log("AddCommentCount error: "+ error);
    }
  });
}

AddPostCount = function(userId){

  Meteor.users.update({_id: userId}, {$inc: {postCount: 1}}, function(error, numOfFileAffected){
    if(error){
      console.log("AddPostCount error: "+ error);
    }
  });
}

UpdateVIP = function(parseId, isVIP, response){

  var user = Meteor.users.findOne({parseId: parseId});

  if (!user) {
    var result = JSON.stringify({
      "error": "user not exist."
    });
    response.statusCode = 400;
    response.write(result);
    response.end()
    return;
  }

  Meteor.users.update({parseId: parseId},{$set: {"isVIP": isVIP}}, function (error, affected) {
    if (error) {
      var result = JSON.stringify({
        "result": false,
        "error": "update vip failed."
      });
      response.statusCode = 400;
      response.write(result);
      response.end()
      return;
    }


    var result = JSON.stringify({
      "result": true
    });
    response.write(result);
    response.end()
    return;
  });
}
