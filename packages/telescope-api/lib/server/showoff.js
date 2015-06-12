GetShowOffFromJsonString = function(jsonString) {

  console.log("get showoff from json string: " + JSON.stringify(jsonString));
  var userId = jsonString["authorId"];
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

  console.log("parseId :" + parseId);

  var providePostProperties = ['showOffItemType', 'authorId', 'themeDisplayName', 'descriptionTitle', 'descriptionContent' , 'bigPreviewURL' , 'packageURL' , 'deviceType' , 'price' , 'bigPreviewWidth' , 'bigPreviewHeight' , 'fontName'];
  var defaultShowOff = {
    createdAt: new Date(),
    postedAt: new Date(),
    commentConut: 0,
    commenters: [],
    downvoters: [],
    downvotes: 0,
    upvoters: [],
    upvotes: 0,
    purchasers: [],
    purchases: 0,
    viewCount: 0,
    inactive: true,
    parseId: parseId
  };

  var newShowOff = defaultShowOff;
  var res = true;
  var missingProperty;
  providePostProperties.forEach(function(property) {

      newShowOff[property] = jsonString[property];
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
      newShowOff: newShowOff
    };
  }
  return result;
};

uploadShowOff = function(newShowOff, response) {

  var userId = newShowOff.userId;
  // if (!userId) {
  //   var result = {
  //     result: false,
  //     error: "new post must has userId"
  //   };
  //   response.write(JSON.stringify(result));
  //   response.end();
  //   return;
  // }
  console.log("insert new showOff:" + JSON.stringify(newShowOff));
  Showoffs.insert(newShowOff, function(error, newShowOffID) {
    if (error) {
      var result = {
        result: false,
        error: error.reason
      };
      response.write(JSON.stringify(result));
    } else {
      var result = {
        result: true,
        newShowOffID: newShowOffID
      };
      response.write(JSON.stringify(result));

      var item = Showoffs.findOne({_id: newShowOffID});
      updateShowOffScore({
        collection: Showoffs,
        item: item,
        forceUpdate: true,
        firstTime: true
      });
    }
    response.end();
  })
};

GetCategoryShowOff = function(userId, itemId, limitSegment, skip, device_Type) {
  var showoffs = [];
  var limit = typeof limitSegment === 'undefined' ? 20 : limitSegment // default limit: 20 showoffs
  var search = {deviceType: device_Type};
  if (itemId != undefined) {
      search['_id'] = itemId;
  }

  skip = typeof skip === 'undefined' ? 0 : skip;
  console.log("will get showoff  limit " + limit + " skip " + skip);
  console.log("deviceType : " + device_Type);
  Showoffs.find(search, {sort: {createdAt: -1},limit: limit,skip: skip}).forEach(function(showoffItem) {
    var hasPurchased = showoffItem.purchasers != undefined ? (showoffItem.purchasers.contains(userId)? true: false) : false;
    var hasLiked = showoffItem.upvoters != undefined ? (showoffItem.upvoters.contains(userId)? true: false)  : false;

    var authorAvatar;
    var authorName;
    var isAuthorVIP;
    var author =  Meteor.users.findOne({_id: showoffItem.authorId});
    if (author != undefined) {
      authorAvatar = author.avatar;
      authorName = author.username;
      isAuthorVIP = author.isVIP;
    }

    var properties = {

      showOffID: showoffItem._id,
      authorId: showoffItem.authorId,
      authorName: authorName,
      authorFaceURL: authorAvatar,
      themeDisplayName: showoffItem.themeDisplayName,
      descriptionTitle: showoffItem.descriptionTitle,
      introduce: showoffItem.descriptionContent,
      previewURL: showoffItem.bigPreviewURL,
      packageURL: showoffItem.packageURL,
      price: showoffItem.price,
      numOfDownload:showoffItem.purchases,
      numOfLikes:showoffItem.upvotes,
      numOfComments:showoffItem.commentConut,
      uploadedAt:showoffItem.createdAt,
      bigPreviewWidth:showoffItem.bigPreviewWidth,
      bigPreviewHeight:showoffItem.bigPreviewHeight,
      hasPurchased:hasPurchased,
      hasLiked:hasLiked,
      parseId:showoffItem.parseId,
      fontName:showoffItem.fontName,
      isAuthorVIP:isAuthorVIP

    };
    showoffs.push(properties);
  });
  var res = {
    showoffs: showoffs
  };
  return JSON.stringify(res);
};

LikeShowOff = function(showOffId, userId, response) {

  if (!showOffId || !userId) {
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
  var showOffItem = Showoffs.findOne({
    _id: showOffId
  });

  if (user && showOffItem) {
    var likers = showOffItem.upvoters;
    var likes = showOffItem.upvotes;
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

    Showoffs.update({
      _id: showOffId
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

    var item = Showoffs.findOne({_id: showOffId});
    updateShowOffScore({
      collection: Showoffs,
      item: item,
      forceUpdate: true
    });

  }
  else{
    response.write(JSON.stringify({
      result: false,
      error: "wrong params"
    }));
    response.end();
  };
}

UnlikeShowOff = function(showOffId, userId, response) {

  console.log("showoffid :" + showOffId + "; userId :" + userId);
  if (!showOffId || !userId) {
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
  var showOffItem = Showoffs.findOne({
    _id: showOffId
  });

  if (user && showOffItem) {
    var likers = showOffItem.upvoters;
    var likes = showOffItem.upvotes;
    var hasLiked = false;
    var likeIndex;
    for (var i = likers.length - 1; i >= 0; i--) {
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

    Showoffs.update({
      _id: showOffId
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

    var item = Showoffs.findOne({_id: showOffId});
    updateShowOffScore({
      collection: Showoffs,
      item: item,
      forceUpdate: true
    });

  }
  else{
    response.write(JSON.stringify({
      result: false,
      error: "wrong params"
    }));
    response.end();
  };
}

PurchaseShowOff = function(showOffId, userId, response) {

  console.log("purchase for showoffid :" + showOffId + "; userId :"  + userId);
  if (!showOffId) {
    result = {
      result: false,
      error: "params error"
    };
    response.write(JSON.stringify(result));
    response.end();
    return;
  }

  var showOffItem = Showoffs.findOne({
    _id: showOffId
  });

  if (showOffItem) {
    var buys = showOffItem.purchases;
    buys ++;

    Showoffs.update({
      _id: showOffId
    },
    {
      $set:{purchases: buys},
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

    var item = Showoffs.findOne({_id: showOffId});
    updateShowOffScore({
      collection: Showoffs,
      item: item,
      forceUpdate: true
    });

  }
  else{
    response.write(JSON.stringify({
      result: false,
      error: "wrong params"
    }));
    response.end();
  };
}

DeleteShowOff = function(showOffId, userId, response) {

  console.log("delete for showoffid :" + showOffId + "; userId :"  + userId);
  if (!showOffId || !userId) {
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
  var showOffItem = Showoffs.findOne({
    _id: showOffId
  });

  if (user && showOffItem) {
    ShowoffComments.find({showOffId: showOffId},{sort: {createdAt: -1}}).forEach(function(showOffCommentItem) {
      ShowoffComments.remove(showOffCommentItem,function(error){

      });
    })

    Showoffs.remove(showOffItem, function(error) {
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

  }
  else{
    response.write(JSON.stringify({
      result: false,
      error: "wrong params"
    }));
    response.end();
  };
}
