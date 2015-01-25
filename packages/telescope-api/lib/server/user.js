// Parse.initialize("cJqO34Np8QgRdTanEjWRUjtjk9XiLRijAhVAVWsh", "OpOAgB5SVn2q7ulxz29rcxjOBeMeKuVQVrJsJWZz");

GetUser = function(parseId, reponse) {
  var user = Meteor.users.findOne({parseId: parseId})

  delete user.services;
  delete user.email_hash;

  return JSON.stringify(user);
}

CreateUserFromParse = function(parseId, response) {
  // TODO: get user info from parse
  var result = JSON.stringify({
    "error": "not implemented."
  });

  response.write(result);
  response.end()
  return;
}

CreateUser = function(userInfo, response) {
  var username = userInfo.username;
  var password = userInfo.password;
  var email = userInfo.email;

  if (!username || !password || !email) {
    var result = JSON.stringify({
      "error": "params not valid."
    });
    response.statusCode = 400;
    response.write(result);
    response.end()
    return;
  }

  // search if user exsited
  var user = Meteor.users.findOne({username: username});
  if (!user) {
    console.log("user not found! create now...");

    var userId = Accounts.createUser({username: username,
                         email: email,
                         password: password});

      if (!userId) {
        response.statusCode = 500;
        var result = JSON.stringify({
          "error": "create user failed, sys err."
        });
        response.write(result);
        response.end();
      } else {
        var result = JSON.stringify({
          "userId": userId
        });
        response.write(result);
        response.end();
      }
  } else {
    var result = JSON.stringify({
      "error": "user already existed."
    });
    response.statusCode = 400;
    response.write(result);
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
