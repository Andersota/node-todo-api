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
		text : 'Second Todo',
		completed : true,
		completedAt : new Date().getTime()
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

		var newTodo = {
			text : 'Test Todo text'
		};

		request( app )
			.post( '/todos' )
			.send( newTodo )
			.expect( 200 )
			.expect( ( res ) => {
				expect( res.body.todo.text ).toBe( newTodo.text );
			})
			.end( ( err, res ) => {

				if( err ){
					done( err );
					return;
				}

				Todo.find({ text : newTodo.text }).then( ( todos ) => {
					expect( todos.length ).toBe( 1 );
					expect( todos[0].text ).toBe( newTodo.text );
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

describe( 'DELETE /todos/:id', () => {

	it( 'should remove a todo with id', ( done ) => {

		var id = todos[0]._id.toHexString();

		request( app )
			.delete( '/todos/' + id )
			.expect( 200 )
			.expect( ( res ) => {
				expect( res.body.todo.text ).toBe( todos[0].text );
			})
			.end( ( err, res ) => {
				
				if( err ){
					return done( err );
				}

				Todo.findById( id ).then( ( todo ) => {

					expect( todo ).toBeFalsy();
					done();
				}).catch( ( e ) => {
					done( e );
				});
			});
	});

	it( 'should return 404 if todo with id not found', ( done ) => {

		var id = new ObjectID().toHexString();

		request( app )
			.delete( '/todos/' + id )
			.expect( 404 )
			.end( done );
	});

	it( 'should return 404 if id not valid', ( done ) => {

		var id = 123;

		request( app )
			.delete( '/todos/' + id )
			.expect( 404 )
			.end( done );
	});
});

describe( 'PATCH /todos/:id', () => {

	it( 'should update a todo with id', ( done ) => {

		var id = todos[0]._id.toHexString();

		var newTodo = {
			text : 'Test Todo update',
			completed : true
		};

		request( app )
			.patch( '/todos/' + id )
			.send( newTodo )
			.expect( 200 )
			.expect( ( res ) => {
				expect( res.body.todo.text ).toBe( newTodo.text );
				expect( res.body.todo.completed ).toBe( true );
				expect( res.body.todo.completedAt ).toBeTruthy();
			})
			.end( ( err, res ) => {

				if( err ){
					done( err );
					return;
				}

				Todo.findById( id ).then( ( todo ) => {
					expect( todo.text ).toBe( newTodo.text );
					done();
				}).catch( ( e ) => {
					done( e );
				})
			});
	});
});