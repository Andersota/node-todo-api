const expect = require( 'expect' );
const request = require( 'supertest' );

const {app} = require( './../server.js' );
const {Todo} = require( './../models/todo.js' );

beforeEach( ( done ) => {
	Todo.remove({}).then( () => {
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

				Todo.find().then( ( todos ) => {
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
					expect( todos.length ).toBe( 0 );
					done();
				}).catch( ( e ) => {
					done( e );
				})
			});
	});
});