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

	db.collection( 'Todos' )
	.find( { 
		_id : new ObjectID( '5b634e9f0170131043f31249' )
	})
	.toArray()
	.then( ( result ) => {

		console.log( result );

	}, ( error ) => {
		console.log( 'Find failed' );
	});

	//client.close();
});