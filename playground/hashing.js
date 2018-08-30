const {SHA256} = require( 'crypto-js' );

const jwt = require( 'jsonwebtoken' );

var message = 'I am jonny';
var hash = SHA256( message ).toString();

//console.log( hash );

var data = {
	id : 4
};

var token = {
	data : data,
	hash : SHA256( JSON.stringify( data ) + 'salt string' ).toString()
};



var token = jwt.sign( data, 'salt string' );

console.log( token );

var decoded = jwt.verify( token, 'salt string' );

console.log( decoded );