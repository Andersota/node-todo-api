const expect = require( 'expect' );
const request = require( 'supertest' );
const {ObjectID} = require( 'mongodb' );

const {app} = require( './../server.js' );
const {User} = require( './../models/user.js' );
const {Todo} = require( './../models/todo.js' );

const { users, todos, loadUsers, loadTodos } = require( './seed.js' );

beforeEach( loadUsers );
beforeEach( loadTodos );

// Users
describe( 'GET /users', () => {

	it( 'Should get all users', ( done ) => {
		
		request( app )
			.get( '/users' )
			.expect( 200 )
			.expect( ( res ) => {
				expect( res.body.users.length ).toBe( 2 );
			})
			.end( done );
	});
});

describe( 'GET /users/me', () => {

	it( 'Should return user if authenticated', ( done ) => {

		request( app )
			.get( '/users/me' )
			.set( 'x-auth', users[0].tokens[0].token )
			.expect( 200 )
			.expect( ( res ) => {
				expect( res.body.user._id ).toBe( users[0]._id.toHexString() );
				expect( res.body.user.email ).toBe( users[0].email );
			})
			.end( done );
	});

	it( 'Should return 401 if not authenticated', ( done ) => {
		
		request( app )
			.get( '/users/me' )
			.expect( 401 )
			.expect( ( res ) => {
				expect( res.body ).toEqual( {} );
			})
			.end( done );
	});
});

describe( 'GET /users/:id', () => {

});

describe( 'POST /users', () => {

	it( 'Should create a new User', ( done ) => {

		var email = 'user3@email.com';
		var password = 'user3password';

		request( app )
			.post( '/users' )
			.send( { 
				email : email,
				password : password 
			})
			.expect( 200 )
			.expect( ( res ) => {
				expect( res.headers['x-auth'] ).toBeTruthy();
				expect( res.body.user._id ).toBeTruthy();
				expect( res.body.user.email ).toBe( email );
			})
			.end( ( err ) => {
				
				if( err ){
					done( err );
				}

				User.findOne( {
					email : email
				}).then( ( user ) => {
					expect( user ).toBeTruthy();
					done();
				}).catch( ( e ) => {
					done( e );
				});
			});
	});

	it( 'Should return 400 when email invalid', ( done ) => {
		
		var email = 'user3';
		var password = 'user3password';

		request( app )
			.post( '/users' )
			.send( { 
				email : email,
				password : password 
			})
			.expect( 400 )
			.end( done );
	});

	it( 'Should return 400 when password invalid', ( done ) => {
		
		var email = 'user3@email.com';
		var password = '1';

		request( app )
			.post( '/users' )
			.send( { 
				email : email,
				password : password 
			})
			.expect( 400 )
			.end( done );
	});

	it( 'Should return 400 if email in use', ( done ) => {
		
		var email = users[0].email;
		var password = users[0].password;

		request( app )
			.post( '/users' )
			.send( { 
				email : email,
				password : password 
			})
			.expect( 400 )
			.end( done );
	});
});

describe( 'POST /users/login', () => {

	it( 'Should log User in and return auth token', ( done ) => {

		var email = users[1].email;
		var password = users[1].password;

		request( app )
			.post( '/users/login' )
			.send( { 
				email : email,
				password : password 
			})
			.expect( 200 )
			.expect( ( res ) => {
				expect( res.headers['x-auth'] ).toBeTruthy();
			})
			.end( ( err, res ) => {
				
				if( err ){
					done( err );
				}

				User.findById( res.body.user._id ).then( ( user ) => {
					expect( user.toObject().tokens[1] ).toMatchObject({
					    access : 'auth',
					    token : res.headers['x-auth']
					});
					done();
				}).catch( ( e ) => {
					done( e );
				});
			});
	});

	it( 'Should reject invalid login', ( done ) => {

		var email = 'user3@email.com';
		var password = 'user3password';

		request( app )
			.post( '/users/login' )
			.send( { 
				email : email,
				password : password 
			})
			.expect( 400 )
			.end( done );
	});
});

describe( 'DELETE /users/me/token', () => {

	it( 'Should remove auth token', ( done ) => {

		request( app )
			.delete( '/users/me/token' )
			.set( 'x-auth', users[0].tokens[0].token )
			.expect( 200 )
			.end( ( err, res ) => {
				
				if( err ){
					done( err );
				}

				User.findById( users[0]._id ).then( ( user ) => {
					expect( user.toObject().tokens.length ).toBe( 0 );
					done();
				}).catch( ( e ) => {
					done( e );
				});
			});
	});
});

// Todos
describe( 'GET /todos', () => {

	it( 'Should get all todos', ( done ) => {
		
		request( app )
			.get( '/todos' )
			.set( 'x-auth', users[0].tokens[0].token )
			.expect( 200 )
			.expect( ( res ) => {
				expect( res.body.todos.length ).toBe( 1 );
			})
			.end( done );
	});
});

describe( 'GET /todos/:id', () => {

	it( 'Should get a todo with id', ( done ) => {

		var id = todos[0]._id.toHexString();

		request( app )
			.get( '/todos/' + id )
			.set( 'x-auth', users[0].tokens[0].token )
			.expect( 200 )
			.expect( ( res ) => {
				expect( res.body.todo.text ).toBe( todos[0].text );
			})
			.end( done );
	});

	it( 'Should return 404 if different _creator', ( done ) => {

		var id = todos[0]._id.toHexString();

		request( app )
			.get( '/todos/' + id )
			.set( 'x-auth', users[1].tokens[0].token )
			.expect( 404 )
			.end( done );
	});

	it( 'Should return 404 if todo with id not found', ( done ) => {

		var id = new ObjectID().toHexString();

		request( app )
			.get( '/todos/' + id )
			.set( 'x-auth', users[0].tokens[0].token )
			.expect( 404 )
			.end( done );
	});

	it( 'Should return 404 if id not valid', ( done ) => {

		var id = 123;

		request( app )
			.get( '/todos/' + id )
			.set( 'x-auth', users[0].tokens[0].token )
			.expect( 404 )
			.end( done );
	});
});

describe( 'POST /todos', () => {

	it( 'Should create a new Todo', ( done ) => {

		var newTodo = {
			text : 'Test Todo text'
		};

		request( app )
			.post( '/todos' )
			.set( 'x-auth', users[0].tokens[0].token )
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
				});
			});
	});

	it( 'Should not create a new Todo', ( done ) => {

		request( app )
			.post( '/todos' )
			.set( 'x-auth', users[0].tokens[0].token )
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
				});
			});
	});
});

describe( 'PATCH /todos/:id', () => {

	it( 'Should update a todo with id', ( done ) => {

		var id = todos[0]._id.toHexString();

		var newTodo = {
			text : 'Test Todo update',
			completed : true
		};

		request( app )
			.patch( '/todos/' + id )
			.set( 'x-auth', users[0].tokens[0].token )
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
				});
			});
	});

	it( 'Should return 404 if different _creator', ( done ) => {

		var id = todos[0]._id.toHexString();

		var newTodo = {
			text : 'Test Todo update',
			completed : true
		};

		request( app )
			.patch( '/todos/' + id )
			.set( 'x-auth', users[1].tokens[0].token )
			.send( newTodo )
			.expect( 404 )
			.end( ( err, res ) => {
				
				if( err ){
					return done( err );
				}

				Todo.findById( id ).then( ( todo ) => {

					expect( todo.text ).toBe( todos[0].text );
					done();
				}).catch( ( e ) => {
					done( e );
				});
			});
	});

	it( 'Should return 404 if todo with id not found', ( done ) => {

		var id = new ObjectID().toHexString();

		var newTodo = {
			text : 'Test Todo update',
			completed : true
		};

		request( app )
			.patch( '/todos/' + id )
			.set( 'x-auth', users[0].tokens[0].token )
			.send( newTodo )
			.expect( 404 )
			.end( done );
	});

	it( 'Should return 404 if id not valid', ( done ) => {

		var id = 123;

		var newTodo = {
			text : 'Test Todo update',
			completed : true
		};

		request( app )
			.patch( '/todos/' + id )
			.set( 'x-auth', users[0].tokens[0].token )
			.send( newTodo )
			.expect( 404 )
			.end( done );
	});
});

describe( 'DELETE /todos/:id', () => {

	it( 'Should remove a todo with id', ( done ) => {

		var id = todos[0]._id.toHexString();

		request( app )
			.delete( '/todos/' + id )
			.set( 'x-auth', users[0].tokens[0].token )
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

	it( 'Should return 404 if different _creator', ( done ) => {

		var id = todos[0]._id.toHexString();

		request( app )
			.delete( '/todos/' + id )
			.set( 'x-auth', users[1].tokens[0].token )
			.expect( 404 )
			.end( ( err, res ) => {
				
				if( err ){
					return done( err );
				}

				Todo.findById( id ).then( ( todo ) => {

					expect( todo ).toBeTruthy();
					done();
				}).catch( ( e ) => {
					done( e );
				});
			});
	});

	it( 'Should return 404 if todo with id not found', ( done ) => {

		var id = new ObjectID().toHexString();

		request( app )
			.delete( '/todos/' + id )
			.set( 'x-auth', users[0].tokens[0].token )
			.expect( 404 )
			.end( done );
	});

	it( 'Should return 404 if id not valid', ( done ) => {

		var id = 123;

		request( app )
			.delete( '/todos/' + id )
			.set( 'x-auth', users[0].tokens[0].token )
			.expect( 404 )
			.end( done );
	});
});