// Parse.initialize("cJqO34Np8QgRdTanEjWRUjtjk9XiLRijAhVAVWsh", "OpOAgB5SVn2q7ulxz29rcxjOBeMeKuVQVrJsJWZz");

GetUser = function(parseId, reponse) {
  var user = Meteor.users.findOne({parseId: parseId})

  delete user.services;
  delete user.email_hash;

  return JSON.stringify(user);
}

CreateUser = function(userInfo, response) {

  var parseId = userInfo.parseId;
  var services = userInfo.services;
  var result;
  if (!parseId || !services) {
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
  var email = userInfo.email;
  
  console.log(username + " " + email);
  // search if user exsited
  var user = Meteor.users.findOne({parseId: parseId});
  if (!user) {
    try{
      var userId = Accounts.createUser({username: username,
                         email: email});
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
        Meteor.users.update({_id: userId},{$set:{services: services, parseId: parseId}}, function(error, numOfFileAffected){
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
          result: false,
          error: 'user exsited'
        };
    response.statusCode = 400;
    response.write(JSON.stringify(result));
    response.end()
  }
}

UpdateUser = function (parseId, userInfo, response) {
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

  Users.update({parseId: parseId}, userInfo, function (error, affected) {
    if (!error) {
      var result = JSON.stringify({
        "error": "update user failed."
      });
      response.statusCode = 400;
      response.write(result);
      response.end()
      return;
    }


    var result = JSON.stringify({
      "result": "update succ, " + affected + " document modified."
    });
    response.write(result);
    response.end()
    return;
  });
}

AddFacebookInfo = function(parseId, facebookInfo, response){

  if(facebookInfo.accessToken == undefined){
    var result = {
      result: false,
      error: "facebook info has no accessToken info."
    };
    response.write(result);
    response.end();
    return;
  }
  var needProperties =  [
            "accessToken",
            "email",
            "expiresAt",
            "first_name",
            "gender",
            "id",
            "last_name",
            "link",
            "locale",
            "name"
        ];
  var needInfo;
  for(i in needProperties){
    var property = needProperties[i];
    info[property] = facebookInfo[property];
  }
  
  var ueser = Meteor.users.findOne({parseId: parseId});
  if(!user){
    var result = {
      result: false,
      error: "user not found"
    };
    response.write(result);
    response.end();
    return;
  }
  var services = user.services;
  user['services']['facebook'] = needInfo;
  UpdateUser(parseId, user, response);
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


