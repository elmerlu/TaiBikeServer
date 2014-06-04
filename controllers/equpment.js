'use strict';

var md5 = require('MD5');
var User = require('../models/user');
var keyAuth = require('../lib/auth');

module.exports = function (app) {
	app.post('/user/add-equpment', function(req, res) {
		var authKey = req.session.authKey;

		keyAuth(authKey, function(msg) {
			if(msg.error) {
				res.send(msg);
			} else {
				var name = req.param('name');
				var desc = req.param('desc');
				var weight = req.param('weight');
				var minTemp = req.param('minTemp');
				var maxTemp = req.param('maxTemp');
				var equpment = {name:name, description:desc, weight:weight, minTemp:minTemp, maxTemp:maxTemp};
				User.update({authKey:authKey}, {$push:{equpments:equpment}}, function(err) {
					if(err) {
						res.send({msg:'db update err', error:true});
					} else {
						res.send({msg:'success', error:false});
					}
				});

			}
		});

    });

    app.get('/user/add-equpment', function(req, res) {
    	var authKey = req.session.authKey;
		if (authKey === '' || authKey === undefined) {
			res.redirect('/');
		} else {
			keyAuth(authKey, function(msg) {
				if(msg.error) {
					req.session.authKey = '';
					res.redirect('/');
				} else {
					var equpments = msg.user.equpments;
					res.render('equpment/add', {equpments:equpments});
				}
			});
		}
    });

    app.get('/user/equpments', function(req, res) {
    	var authKey = req.session.authKey;
		if (authKey === '' || authKey === undefined) {
			res.redirect('/');
		} else {
			keyAuth(authKey, function(msg) {
				if(msg.error) {
					req.session.authKey = '';
					res.redirect('/');
				} else {
					var equpments = msg.user.equpments;
					res.render('equpment/equpments', {equpments:equpments});
				}
			});
		}
    });

    app.get('/user/delete-equpment', function(req, res) {

    	var authKey = req.session.authKey;
		if (authKey === '' || authKey === undefined) {
			res.redirect('/');
		} else {
			keyAuth(authKey, function(msg) {
				if(msg.error) {
					req.session.authKey = '';
					res.redirect('/');
				} else {
					var id  = req.param('id');
					User.update({authKey:authKey}, {$pull:{equpments:{_id:id}}}, function(err) {
					if(err) {
						res.send({msg:'db update err', error:true});
					} else {
						res.redirect('/user/equpments');
					}
				});
				}
			});
		}
    });
}