const expect = require( 'expect' );
const request = require( 'supertest' );
const {ObjectID} = require( 'mongodb' );

const {app} = require( './../server.js' );
const {Todo} = require( './../models/todo.js' );

const todos = [
	{
		_id : new ObjectID(),
		text : 'First Todo'
	},
	{
		_id : new ObjectID(),
		text : 'Second Todo'
	}
];

beforeEach( ( done ) => {
	Todo.remove({}).then( () => {
		return Todo.insertMany( todos );
	}).then( () => {
		done();
	});
});

describe( 'POST /todos', () => {

	it( 'Should create a new Todo', ( done ) => {

		var text = 'Test Todo text';

		request( app )
			.post( '/todos' )
			.send( {
				text : text
			})
			.expect( 200 )
			.expect( ( res ) => {

				expect( res.body.text ).toBe( text );
			})
			.end( ( err, res ) => {

				if( err ){
					done( err );
					return;
				}

				Todo.find({ text : text }).then( ( todos ) => {
					expect( todos.length ).toBe( 1 );
					expect( todos[0].text ).toBe( text );
					done();
				}).catch( ( e ) => {
					done( e );
				})
			});
	});

	it( 'Should not create a new Todo', ( done ) => {

		request( app )
			.post( '/todos' )
			.send( {})
			.expect( 400 )
			.end( ( err, res ) => {

				if( err ){
					done( err );
					return;
				}

				Todo.find().then( ( todos ) => {
					expect( todos.length ).toBe( 2 );
					done();
				}).catch( ( e ) => {
					done( e );
				})
			});
	});

});

describe( 'GET /todos', () => {

	it( 'should get all todos', ( done ) => {
		
		request( app )
			.get( '/todos' )
			.expect( 200 )
			.expect( ( res ) => {
				expect( res.body.todos.length ).toBe( 2 );
			})
			.end( done );
	});
});

describe( 'GET /todos/:id', () => {

	it( 'should get a todo with id', ( done ) => {

		var id = todos[0]._id.toHexString();

		request( app )
			.get( '/todos/' + id )
			.expect( 200 )
			.expect( ( res ) => {
				expect( res.body.todo.text ).toBe( todos[0].text );
			})
			.end( done );
	});

	it( 'should return 404 if todo with id not found', ( done ) => {

		var id = new ObjectID().toHexString();

		request( app )
			.get( '/todos/' + id )
			.expect( 404 )
			.end( done );
	});

	it( 'should return 404 if id not valid', ( done ) => {

		var id = 123;

		request( app )
			.get( '/todos/' + id )
			.expect( 404 )
			.end( done );
	});
});