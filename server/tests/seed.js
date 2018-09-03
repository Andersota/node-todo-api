const {ObjectID} = require( 'mongodb' );

const jwt = require( 'jsonwebtoken' );

const {User} = require( './../models/user.js' );
const {Todo} = require( './../models/todo.js' );

var access = 'auth';

const user1Id = new ObjectID();
var user1token = jwt.sign( {
	_id : user1Id.toHexString(),
	access : access
}, process.env.JWT_SECRET ).toString();

const user2Id = new ObjectID();
var user2token = jwt.sign( {
	_id : user2Id.toHexString(),
	access : access
}, process.env.JWT_SECRET ).toString();

const users = [
	{
		_id : user1Id,
		email : 'user1@email.com',
		password : 'user1password',
		tokens : [
			{
				access : access,
				token : user1token
			}
		]
	},
	{
		_id : user2Id,
		email : 'user2@email.com',
		password : 'user2password',
		tokens : [
			{
				access : access,
				token : user2token
			}
		]
	}
];

const todos = [
	{
		_id : new ObjectID(),
		text : 'First Todo',
		_creator : user1Id
	},
	{
		_id : new ObjectID(),
		text : 'Second Todo',
		_creator : user2Id,
		completed : true,
		completedAt : new Date().getTime()
	}
];

const loadUsers = ( done ) => {

	User.remove({}).then( () => {

		var user1 = new User( users[0] ).save();
		var user2 = new User( users[1] ).save();

		return Promise.all( [ user1, user2 ] );
	}).then( () => {
		done();
	});
};

const loadTodos = ( done ) => {
	
	Todo.remove({}).then( () => {
		return Todo.insertMany( todos );
	}).then( () => {
		done();
	});
};

module.exports = {
	users : users,
	todos : todos,
	loadUsers : loadUsers,
	loadTodos : loadTodos
}