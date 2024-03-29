'use strict';

var User = require('../models/user');
var keyAuth = require('../lib/auth');
var Point = require('../models/point');

module.exports = function (app) {


	app.get('/user/add-plan', function(req, res) {
		var authKey = req.session.authKey;
		if (authKey === '' || authKey === undefined) {
			res.redirect('/');
		} else {
			keyAuth(authKey, function(msg) {
				if(msg.error) {
					res.redirect('/');
				} else {
					var ridePlans = msg.user.ridePlans;
					res.render('plans/add');
				}
			});
		}
	});


	app.post('/user/add-plan', function(req, res) {
		var authKey = req.session.authKey;
		if (authKey === '' || authKey === undefined) {
			res.redirect('/');
		} else {
			keyAuth(authKey, function(msg) {
				if(msg.error) {
					res.redirect('/');
				} else {
					var ridePlans = msg.user.ridePlans;

					var name = req.param('name');
					var description = req.param('description');

					// yyyy-MM-ddThh:mm
					var timeStart = new Date(req.param('start_time'));
					var timeEnd = new Date(req.param('end_time'));
					var points = req.param('points');
					var equipments = req.param('equipments');
					var t_points = [];

					for(var i in points) {
						var p = points[i];
						var np = {name:p.name, latitude:p.lat, longitude:p.lng, altitude:0, time:p.time};
						t_points.push(np);
					}

					var plan = {name:name, description:description, timeStart:timeStart, timeEnd:timeEnd, points:t_points, equipments:equipments};

					User.update({authKey:authKey}, {$push:{ridePlans:plan}}, function(err) {
						if(err) {
							res.send({msg:'db update err', error:true});
						} else {
							res.send({msg:'success', error:false});
						}
					});

				}
			});
		}
	});

	app.get('/user/delete-plan', function(req, res) {
		var authKey = req.session.authKey;
		keyAuth(authKey, function(msg) {
			if(msg.error) {
				res.send(msg);
			} else {
				var id = req.param('id');
				var ridePlans = msg.user.ridePlans;

				User.update({authKey:authKey}, {$pull:{ridePlans:{_id:id}}}, function(err) {
					if(err) {
						res.send({msg:'db update err', error:true});
					} else {
						res.redirect('/user/plan');
						// res.send({msg:'success', error:false});
					}
				});


			}
		});
	});

	app.get('/api/plan/add', function (req, res) {
		var authKey = req.param('authKey');

		keyAuth(authKey, function(msg) {
			if(msg.error) {
				res.send(msg);
			} else {
				var name = req.param('name');
				var description = req.param('description');
				var timeStart = new Date(req.param('timeStart'));
				var timeEnd = new Date(req.param('timeEnd'));
				var points = [];
				var plan = {name:name, timeStart:timeStart, timeEnd:timeEnd, points:points};

				User.update({authKey:authKey}, {$push:{ridePlans:plan}}, function(err) {
					if(err) {
						res.send({msg:'db update err', error:true});
					} else {
						res.send({msg:'success', error:false});
					}
				});

			}
		});
	});

	app.post('/user/update-plan', function(req, res) {
		var authKey = req.session.authKey;
		if (authKey === '' || authKey === undefined) {
			res.redirect('/');
		} else {
			keyAuth(authKey, function(msg) {
				if(msg.error) {
					res.send(msg);
				} else {
					var ridePlans = msg.user.ridePlans;

					var pid = req.param('pid');
					var plan = ridePlans.id(pid);

					var name = req.param('name');
					var description = req.param('description');
					var equipments = req.param('equipments');

					// yyyy-MM-ddThh:mm
					var timeStart = new Date(req.param('start_time'));
					var timeEnd = new Date(req.param('end_time'));
					var points = req.param('points');
					var t_points = [];
					for(var i in points) {
						var p = points[i];
						var np = {name:p.name, latitude:p.lat, longitude:p.lng, altitude:0, time:p.time};
						t_points.push(np);
					}

					plan.name = name;
					plan.description = description;
					plan.timeStart = timeStart;
					plan.timeEnd = timeEnd;
					plan.points = t_points;
					plan.equipments = equipments;


					msg.user.save(function(err) {
						if(err) {
							res.send({msg:'db update err', error:true});
						} else {
							res.send({msg:'success', error:false});
						}
					});

				}
			});
		}
	});

	app.get('/api/plan/update', function (req, res) {
		var authKey = req.param('authKey');
		var pid = req.param('pid');

		console.log(authKey);
		console.log(pid);

		keyAuth(authKey, function(msg) {
			if(msg.error) {
				res.send(msg);
			} else {
				var name = req.param('name');
				var timeStart = new Date(req.param('timeStart'));
				var timeEnd = new Date(req.param('timeEnd'));
				var points = req.param('points');

				points = JSON.parse(points);

				var ridePlans = msg.user.ridePlans;

				if (!ridePlans.id(pid)) {
					res.send({msg:'can\'t find plan', error:true});
					return;
				}

				ridePlans.id(pid).name = name;
				ridePlans.id(pid).timeStart = timeStart;
				ridePlans.id(pid).timeEnd = timeEnd;
				ridePlans.id(pid).points = points;

				msg.user.save(function(err) {
					if(err) {
						res.send({msg:'db update err', error:true});
					} else {
						res.send({msg:'success', error:false});
					}
				});
			}
		});
	});


	app.get('/api/plan/record/add', function (req, res) {
		var authKey = req.param('authKey');

		keyAuth(authKey, function(msg) {
			if(msg.error) {
				res.send(msg);
			} else {
				var id = req.param('id');
				var lng = req.param('lng');
				var lat = req.param('lat');
				var alt = req.param('alt');
				var time = new Date(req.param('time'));
				var ridePlans = msg.user.ridePlans;

				ridePlans.id(id).records.push({latitude:lat, longitude:lng, altitude:alt, time:time});

				msg.user.save(function(err) {
					if(err) {
						res.send({msg:'db update err', error:true});
					} else {
						res.send({msg:'success', error:false});
					}
				});

			}
		});
	});

	app.get('/api/user/plans', function(req, res) {
		var authKey = req.param('authKey');
		keyAuth(authKey, function(msg) {
			if(msg.error) {
				res.send(msg);
			} else {
				var ridePlans = msg.user.ridePlans;
				res.send({msg:'success', error:false, ridePlans:ridePlans});
			}
		});
	});

	app.get('/user/plan/records', function(req, res) {
    	var authKey = req.session.authKey;
		if (authKey === '' || authKey === undefined) {
			res.redirect('/');
		} else {
			keyAuth(authKey, function(msg) {
				if(msg.error) {
					res.redirect('/');
				} else {
					var ridePlans = msg.user.ridePlans;
					res.render('plans/records', {ridePlans:ridePlans});
				}
			});
		}
    });

    app.get('/user/plan/record/:pid', function(req, res) {
    	var authKey = req.session.authKey;
    	var pid = req.param('pid');

		if (authKey === '' || authKey === undefined) {
			res.redirect('/');
		} else {
			keyAuth(authKey, function(msg) {
				if(msg.error) {
					res.redirect('/');
				} else {
					var ridePlans = msg.user.ridePlans;
					var plan = ridePlans.id(pid);
					var date = new Date(plan.timeStart);
					plan.timeStart = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
					date = new Date(plan.timeEnd);
					plan.timeEnd = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

					var records = plan.records;

					for(var i in records) {
						var p = records[i];
						p.longitude = (p.longitude + '').substring(0, 7);
						p.latitude = (p.latitude + '').substring(0, 7);
						date = new Date(p.time);
						p.time = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
					}

					res.render('plans/record', {plan:plan, records:records});
				}
			});
		}
    });

	app.get('/api/plan/:pid', function (req, res) {
		var authKey = '';
		if(req.session.authKey === '' || req.session.authKey === undefined) {
			authKey = req.param('authKey');
		} else {
			authKey = req.session.authKey;
		}

		var pid = req.param('pid');
		console.log(authKey);
		console.log(pid);

		keyAuth(authKey, function(msg) {
			if(msg.error) {
				res.send(msg);
			} else {
				var ridePlans = msg.user.ridePlans;
				var plan = ridePlans.id(pid);
				res.send({msg:'success', error:false, plan:plan});
			}
		});
	});

	app.get('/user/plan', function(req, res) {
		var authKey = req.session.authKey;

		if (authKey === '' || authKey === undefined) {
			res.redirect('/');
		} else {
			keyAuth(authKey, function(msg) {
				if(msg.error) {
					res.redirect('/');
				} else {
					var ridePlans = msg.user.ridePlans;
					res.render('plans/plans', {plans:ridePlans})
				}
			});
		}
	});

	app.get('/user/plan/:pid', function(req, res) {
    	var authKey = req.session.authKey;
    	var pid = req.param('pid');

		if (authKey === '' || authKey === undefined) {
			res.redirect('/');
		} else {
			keyAuth(authKey, function(msg) {
				if(msg.error) {
					res.redirect('/');
				} else {
					var ridePlans = msg.user.ridePlans;
					var plan = ridePlans.id(pid);
					if(plan !== undefined) {
						res.render('plans/plan', {plan:plan});
					} else {
						res.redirect('/user/plans');
					}
				}
			});
		}
    });



};
