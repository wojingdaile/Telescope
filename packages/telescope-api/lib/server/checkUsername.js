CheckUsername = function(username, response){
	var user = Meteor.users.findOne({username: username});
	var result;
	if (user) {
		result = {
			result: true
		}
	}
	else{
		result = {
			result: false
		};
	}
	response.write(JSON.stringify(result));
	response.end();
}