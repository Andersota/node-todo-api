const express = require( 'express' );
const bodyParser = require( 'body-parser' );

var {mongoose} = require( './db/mongoose.js' );

var {User} = require( './models/user.js' );
var {Todo} = require( './models/todo.js' );

var app = express();

app.use( bodyParser.json() );

app.post( '/todos', ( req, res ) => {

	var todo = new Todo( {
		text : req.body.text
	});

	todo.save().then( ( todo ) => {
		res.send( todo );
	}, ( e ) => {
		res.status( 400 ).send( e );
	});
});

app.listen( 3000, () => {

});

module.exports = {
	app : app
}