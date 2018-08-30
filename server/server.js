require( './config/config.js' );

const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const _ = require( 'lodash' );
const {ObjectID} = require( 'mongodb' );

var {mongoose} = require( './db/mongoose.js' );

var {authenticate} = require( './middleware/authenticate.js' );

var {User} = require( './models/user.js' );
var {Todo} = require( './models/todo.js' );

var app = express();

const port = process.env.PORT;

app.use( bodyParser.json() );

app.post( '/todos', ( req, res ) => {

	var body = _.pick( req.body, [ 'text' ]);

	var todo = new Todo( body );

	todo.save().then( ( todo ) => {
		
		res.send( {
			todo : todo
		});

	}, ( e ) => {
		res.status( 400 ).send( e );
	});
});

app.get( '/todos', ( req, res ) => {

	Todo.find().then( ( todos ) => {

		res.send( {
			todos : todos
		});

	}).catch( ( e ) => {
		res.status( 400 ).send( e );
	});
});

app.get( '/todos/:id', ( req, res ) => {

	var id = req.params.id;

	if( ! ObjectID.isValid( id ) ){
		res.status( 404 ).send();
		return;
	}

	Todo.findById( id ).then( ( todo ) => {

		if( ! todo ){
			res.status( 404 ).send();
			return;
		}

		res.send( {
			todo : todo
		});

	}).catch( ( e ) => {
		res.status( 400 ).send();
	});
});

app.delete( '/todos/:id', ( req, res ) => {

	var id = req.params.id;

	if( ! ObjectID.isValid( id ) ){
		res.status( 404 ).send();
		return;
	}

	Todo.findByIdAndRemove( id ).then( ( todo ) => {

		if( ! todo ){
			res.status( 404 ).send();
			return;
		}

		res.send( {
			todo : todo
		});

	}).catch( ( e ) => {
		res.status( 400 ).send();
	});
});

app.patch( '/todos/:id', ( req, res ) => {

	var id = req.params.id;
	var body = _.pick( req.body, [ 'text', 'completed' ]);

	if( ! ObjectID.isValid( id ) ){
		res.status( 404 ).send();
		return;
	}

	if( _.isBoolean( body.completed ) && body.completed ){
		body.completedAt = new Date().getTime();
	} else {
		body.completed = false;
		body.completedAt = null;
	}

	Todo.findByIdAndUpdate( id, {
		$set : body
	},
	{
		new : true
	}).then( ( todo ) => {

		if( ! todo ){
			res.status( 404 ).send();
			return;
		}

		res.send( {
			todo : todo
		});

	}).catch( ( e ) => {
		res.status( 400 ).send();
	});
});

app.post( '/users', ( req, res ) => {

	var body = _.pick( req.body, [ 'email', 'password' ]);

	var user = new User( body );

	user.save().then( () => {

		return user.generateAuthToken();
	}).then( ( token ) => {
		
		res.header( 'x-auth', token ).send( {
			user : user
		});

	}).catch( ( e ) => {
		res.status( 400 ).send( e );
	});
});

app.get( '/users', ( req, res ) => {

	User.find().then( ( users ) => {

		res.send( {
			users : users
		});

	}).catch( ( e ) => {
		res.status( 400 ).send( e );
	});
});

app.get( '/users/me', authenticate, ( req, res ) => {

	res.send( {
		user : req.user
	});
});

app.get( '/users/:id', ( req, res ) => {

	var id = req.params.id;

	if( ! ObjectID.isValid( id ) ){
		res.status( 404 ).send();
		return;
	}

	User.findById( id ).then( ( user ) => {

		if( ! user ){
			res.status( 404 ).send();
			return;
		}

		res.send( {
			user : user
		});

	}).catch( ( e ) => {
		res.status( 400 ).send();
	});
});

app.listen( port, () => {
	console.log( 'Started and listening on port ' + port );
});

module.exports = {
	app : app
}