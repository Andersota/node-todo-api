//const MongoClient = require( 'mongodb' ).MongoClient;
const {MongoClient, ObjectID} = require( 'mongodb' );

//var obj = new ObjectID();

MongoClient.connect( 'mongodb://localhost:27017/TodoApp', ( error, client ) => {

	if( error ){
		console.log( 'Unable to connect to database' );
		return;
	}

	console.log( 'Connected to database' );
	const db = client.db( 'TodoApp' );

	// db.collection( 'Todos' ).insertOne( {
	// 	text : 'Something to do',
	// 	completed : false
	// }, ( error, result ) => {

	// 	if( error ){
	// 		console.log( 'Unable to insert todo', error );
	// 		return;
	// 	}

	// 	console.log( result.ops );
	// });

	// db.collection( 'Users' ).insertOne( {
	// 	name : 'Jonny',
	// 	age : 34,
	// 	location : 'Shakopee'
	// }, ( error, result ) => {

	// 	if( error ){
	// 		console.log( 'Unable to insert user', error );
	// 		return;
	// 	}

	// 	console.log( result.ops );
	// });

	client.close();
});