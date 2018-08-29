const {ObjectID} = require( 'mongodb' );

const {mongoose} = require( './../server/db/mongoose.js' );
const {Todo} = require( './../server/models/todo.js' );

var id = '5b85e4ce62a9d928b0126de4';

Todo.remove({}).then( ( result ) => {
	console.log( result );
});

// Todo.findAndRemoveOne()

Todo.findByIdAndRemove( id ).then( ( todo ) => {

	if( ! todo ){
		console.log( 'Todo with Id not found' );
		return;
	}

});