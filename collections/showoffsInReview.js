
// ------------------------------------------------------------------------------------------- //
// ----------------------------------------- Schema ----------------------------------------- //
// ------------------------------------------------------------------------------------------- //

showOffInReviewSchemaObject = {
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
  parseId:{
    type: String,
    optional: true
  },
  showOffInReviewItemType:{
    type: Number,
    optional: true
  },
  authorId:{
    type: String,
    optional: true
  },
  themeDisplayName:{
    type: String,
    optional: true
  },
  descriptionTitle:{
    type: String,
    optional: true
  },
  descriptionContent:{
    type: String,
    optional: true
  },
  bigPreviewURL:{
    type: String,
    optional: true
  },
  packageURL:{
    type: String,
    optional: true
  },
  deviceType:{
    type: String,
    optional: true
  },
  price:{
    type: Number,
    optional: true
  },
  fontName:{
    type: String,
    optional: true
  },
  bigPreviewWidth:{
    type: Number,
    optional: true
  },
  bigPreviewHeight:{
    type: Number,
    optional: true
  },
  commentConut:{
    type: Number,
    optional: true
  },
  commenters:{
    type: [String],
    optional: true
  },
  downvotes:{
    type: Number,
    optional: true
  },
  downvoters:{
    type: [String],
    optional: true
  },
  upvotes:{
    type: Number,
    optional: true
  },
  upvoters:{
    type: [String],
    optional: true
  },
  purchases:{
    type: Number,
    optional: true
  },
  purchasers:{
    type: [String],
    optional: true
  },
  viewCount:{
    type: Number,
    optional: true
  },
  inactive:{
    type: Boolean,
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
ShowoffsInReview = new Meteor.Collection("showoffs_in_review");

showOffInReviewSchema = new SimpleSchema(showOffInReviewSchemaObject);

ShowoffsInReview.attachSchema(showOffInReviewSchema);

// ------------------------------------------------------------------------------------------- //
// ----------------------------------------- Helpers ----------------------------------------- //
// ------------------------------------------------------------------------------------------- //


// ------------------------------------------------------------------------------------------- //
// ------------------------------------------ Hooks ------------------------------------------ //
// ------------------------------------------------------------------------------------------- //

// ------------------------------------------------------------------------------------------- //
// --------------------------------------- Submit Post --------------------------------------- //
// ------------------------------------------------------------------------------------------- //

submitShowOffInReview = function (showOffInReview) {

  var userId = showOffInReview.userId, // at this stage, a userId is expected
      user = Meteor.users.findOne(userId);

  // ------------------------------ Checks ------------------------------ //

  // check that a title was provided
  if(!showOffInReview.title)
    throw new Meteor.Error(602, i18n.t('please_fill_in_a_title'));

  // check that there are no posts with the same URL
  if(!!showOffInReview.url)
    checkForPostsWithSameUrl(showOffInReview.url, user);

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

  showOffInReview = _.extend(defaultProperties, showOffInReview);

  // if post is approved but doesn't have a postedAt date, give it a default date
  // note: pending posts get their postedAt date only once theyre approved
  if (showOffInReview.status == STATUS_APPROVED && !showOffInReview.postedAt)
    showOffInReview.postedAt = new Date();

  // clean up post title
  showOffInReview.title = cleanUp(showOffInReview.title);

  // ------------------------------ Callbacks ------------------------------ //

  // run all post submit server callbacks on post object successively
  showOffInReview = postSubmitMethodCallbacks.reduce(function(result, currentFunction) {
      return currentFunction(result);
  }, showOffInReview);

  // -------------------------------- Insert ------------------------------- //

  showOffInReview._id = Showoffs.insert(showOffInReview);

  // --------------------- Server-Side Async Callbacks --------------------- //

  if (Meteor.isServer) {
    Meteor.defer(function () { // use defer to avoid holding up client
      // run all post submit server callbacks on post object successively
      showOffInReview = postAfterSubmitMethodCallbacks.reduce(function(result, currentFunction) {
          return currentFunction(result);
      }, showOffInReview);
    });
  }

  return showOffInReview;
}

// ------------------------------------------------------------------------------------------- //
// ----------------------------------------- Methods ----------------------------------------- //
// ------------------------------------------------------------------------------------------- //
