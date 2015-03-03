GetAvatar = function(userId, response){

	var user = Meteor.users.findOne({_id: userId});
	if(!user){
		var result = {
			result: false,
			error: "user not found"
		};
		response.write(JSON.stringify(result));
    	response.end()
	}
	else{
		var avatar = user.avatar;
		if(!avatar){
			var result = {
				result: false,
				error: "avatar not found"
			};
			response.write(JSON.stringify(result));
    		response.end()
		}
		else{
			var result = {
				result: true,
				avatar: avatar
			};
			response.write(JSON.stringify(result));
    		response.end()
		}
	}
}