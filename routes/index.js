var express = require('express');
var router = express.Router();
var passportConf = require('../config/passport');
var order = require('../controllers/deliverOrder');


router.put('/sampledeliver/:id', passportConf.isAuthorized, function(req,res,next){
    var params = req.body;
    params.id = req.params.id;
    params.user_id = req.user._id;

    if(!params.updateobj) return next(new Error("updateobj missing"));
    if(!params.updateobj.status) params.updateobj.status = "Completed";
    if(!params.updateobj.logistic) return next(new Error("logistic details missing"));
    if(!params.updateobj.deliverySignature) return next(new Error("signature missing"));
    //if(!params.updateobj.comments) return next(new Error("comments missing"));

	
	order.update(params, function(e, r){
		if(e) return next(e);
		return res.json({response:"Order delivered"});
	});
});

module.exports = router;