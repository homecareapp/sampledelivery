var mongoose = require('mongoose');
var async = require('async');

var Model = require('../models/Order');

function update(params, callback){
	var prescriptions = [], logistic = {}, log = [], comments= [], order = {};
	function getOrder(next) {
		Model.findById(params.id,{}, { lean:true }, function(e,r){
			if(e) return next(e);
			if(!r.prescriptions) r.prescriptions = [];
			prescriptions = r.prescriptions;
			logistic = r.logistic;
			log = r.log;
			comments = r.comments;
			statuslog = r.statuslog
			order = r;
			return next(null);
		});
	}

	function updateOrder(next) {


		// if(params.updateobj.deliverySignature)
		// {
		// 	var sign = false;
	 //        prescriptions.forEach(function(prep){
	 //            if(prep.description == "LabAssistant Signature" 
  //                   || prep.description == "Logistics Signature" 
  //                   || prep.description == "Delivery Signature")
  //               {
  //                   sign = true
  //               }
	            
	 //        })

	 //        if(!sign)
	 //        {
	 //            prescriptions.push(params.updateobj.deliverySignature);
	            
	 //        }
		// }

	    prescriptions.push(params.updateobj.deliverySignature);



		//if(Array.isArray(visitcomments) && params.updateobj.visitcomment) visitcomments.push(params.updateobj.visitcomment);
		if(logistic && params.updateobj.logistic) 
		{
			logistic=params.updateobj.logistic;
			// if(params.updateobj.logistic.logistic_id)
			// {
			// 	if(typeof params.updateobj.logistic.logistic_id == 'object')
			// 	{
			// 		if(params.updateobj.logistic.logistic_id._id)
			// 		{
			// 			logistic.logistic_id = mongoose.Types.ObjectId(params.updateobj.logistic.logistic_id._id)
			// 		}
			// 	}
			// 	else
			// 	{
			// 		logistic.logistic_id = mongoose.Types.ObjectId(params.updateobj.logistic.logistic_id)
			// 	}
			// }
		}
		if(Array.isArray(comments) && params.updateobj.comments) comments.push(params.updateobj.comments);

		if(Array.isArray(log)) 
		{
			var logobj = {};
			logobj.action = "statuschanged"

			if(params.updateobj.status == "Completed")
			{
				logobj.comments = "status updated to delivered";
			}
			else if(params.updateobj.status == "SampleHandover")
			{
				logobj.comments = "status updated to en route";
			}

			logobj["oldstatus"] = order.status;
	        logobj["newstatus"] = params.updateobj.status;
	        logobj["updatedby"] = params.user_id;
	        logobj["updateddatetime"] = Date();
			log.push(logobj);
		}

		var statusLogObj = {
            status: params.updateobj.status,
            statustimestamp: Date(),
            statusby: params.user_id,
            coordinates: params.coordinates
        }



        if(!statuslog) statuslog = [];
        statuslog.push(statusLogObj);


		var updateobj = {
			prescriptions: prescriptions,
			status:params.updateobj.status,
			logistic: logistic,
			log: log,
			comments:comments,
			statuslog:statuslog
		}

		if(params.updateobj.status == "Completed")
		{
			updateobj.servicetime = Date.now();
		}

		Model.update({"_id":params.id},{ $set:updateobj }, function(e,r){
			if(e) return next(e);

			return next(null);
		});
	}

	async.waterfall([getOrder, updateOrder], function(e){
		if(e) return callback(e);
		return callback(null)
	});
}

exports.update = update;