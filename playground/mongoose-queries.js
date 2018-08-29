const {ObjectID} = require( 'mongodb' );

const {mongoose} = require( './../server/db/mongoose.js' );
const {Todo} = require( './../server/models/todo.js' );

var id = '5b85e4ce62a9d928b0126de4';
//var id = '5b85e4ce62a9d928b0126de411';

if( ! ObjectID.isValid( id ) ){
	console.log( 'Id not valid' );
}

Todo.find({
	_id : id
}).then( ( todos ) => {
	console.log( todos );
}, ( e ) => {
	console.log( e );
});

Todo.findOne({
	_id : id
}).then( ( todo ) => {
	console.log( todo );
}, ( e ) => {
	console.log( e );
});

Todo.findById( id ).then( ( todo ) => {

	if( ! todo ){
		console.log( 'Todo with Id not found' );
		return;
	}

	console.log( todo );
}).catch( ( e ) => {
	console.log( e );
});