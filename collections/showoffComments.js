
// ------------------------------------------------------------------------------------------- //
// ----------------------------------------- Schema ----------------------------------------- //
// ------------------------------------------------------------------------------------------- //

showOffCommentSchemaObject = {
  _id: {
    type: String,
    optional: true,
    autoform: {
      omit: true
    }
  },
  createdAt: {
    type: Date,
    optional: true,
    autoform: {
      omit: true
    }
  },
  postedAt: {
    type: Date,
    optional: true,
    autoform: {
      group: 'admin',
      type: "bootstrap-datetimepicker"
    }
  },
  downvoters:{
    type: [String],
    optional: true
  },
  downvotes:{
    type: Number,
    optional: true
  },
  upvoters:{
    type: [String],
    optional: true
  },
  upvotes:{
    type: Number,
    optional: true
  },
  parseId:{
    type: String,
    optional: true
  },
  authorId:{
    type: String,
    optional: true
  },
  commentContent:{
    type: String,
    optional: true
  },
  parentId:{
    type: String,
    optional: true
  },
  showOffId:{
    type: String,
    optional: true
  },
  isRootComment:{
    type: Boolean,
    optional: true
  },
  inactive:{
    type: Boolean,
    optional: true
  },
  level:{
    type: Number,
    optional: true
  },
  score: {
    type: Number,
    decimal: true,
    optional: true,
    autoform: {
      omit: true
    }
  },
  baseScore: {
    type: Number,
    decimal: true,
    optional: true,
    autoform: {
      omit: true
    }
  }
};

// add any extra properties to postSchemaObject (provided by packages for example)
ShowoffComments = new Meteor.Collection("showoffComments");

showOffCommentSchema = new SimpleSchema(showOffCommentSchemaObject);

ShowoffComments.attachSchema(showOffCommentSchema);

// ------------------------------------------------------------------------------------------- //
// ----------------------------------------- Helpers ----------------------------------------- //
// ------------------------------------------------------------------------------------------- //


// ------------------------------------------------------------------------------------------- //
// ------------------------------------------ Hooks ------------------------------------------ //
// ------------------------------------------------------------------------------------------- //

// ------------------------------------------------------------------------------------------- //
// --------------------------------------- Submit Post --------------------------------------- //
// ------------------------------------------------------------------------------------------- //

submitShowOffComment = function (showOffComment) {

  var userId = showOffComment.userId, // at this stage, a userId is expected
      user = Meteor.users.findOne(userId);

  // ------------------------------ Checks ------------------------------ //

  // ------------------------------ Properties ------------------------------ //

  defaultProperties = {
    createdAt: new Date(),
    author: getDisplayNameById(userId),
    upvotes: 0,
    downvotes: 0,
    commentCount: 0,
    clickCount: 0,
    viewCount: 0,
    baseScore: 0,
    score: 0,
    inactive: false,
    sticky: false,
    status: getDefaultPostStatus()
  };

  showOffComent = _.extend(defaultProperties, showOffComment);

  // if post is approved but doesn't have a postedAt date, give it a default date
  // note: pending posts get their postedAt date only once theyre approved
  if (showOffComment.status == STATUS_APPROVED && !showOffComment.postedAt)
    showOffComment.postedAt = new Date();

  // ------------------------------ Callbacks ------------------------------ //

  // run all post submit server callbacks on post object successively
  showOffComment = postSubmitMethodCallbacks.reduce(function(result, currentFunction) {
      return currentFunction(result);
  }, showOffComment);

  // -------------------------------- Insert ------------------------------- //

  showOffComment._id = ShowoffComments.insert(showOffComment);

  // --------------------- Server-Side Async Callbacks --------------------- //

  if (Meteor.isServer) {
    Meteor.defer(function () { // use defer to avoid holding up client
      // run all post submit server callbacks on post object successively
      showOffComment = postAfterSubmitMethodCallbacks.reduce(function(result, currentFunction) {
          return currentFunction(result);
      }, showOffComment);
    });
  }

  return showOffComment;
}

// ------------------------------------------------------------------------------------------- //
// ----------------------------------------- Methods ----------------------------------------- //
// ------------------------------------------------------------------------------------------- //
