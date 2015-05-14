
GetUser = function(parseId, reponse) {
  var user = Meteor.users.findOne({parseId: parseId})

  delete user.services;
  delete user.email_hash;

  return JSON.stringify(user);
}

CreateUser = function(userInfo, response) {

  var parseId = userInfo.parseId;
  var services = userInfo.services;
  var avatar = userInfo.avatar;
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
        Meteor.users.update({_id: userId},{$set:{services: services, parseId: parseId, avatar: avatar}}, function(error, numOfFileAffected){
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
            userId: userId
          };
          response.write(JSON.stringify(result));
          response.end();
          }
        });
      }
  } else {
    result = {
          result: true,
          userId: user._id,
          isAdmin: user.isAdmin,
          avatar: user.avatar
        };
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
