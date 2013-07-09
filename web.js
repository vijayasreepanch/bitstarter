var express = require('express');

var app = express.createServer(express.logger());

var fs = require('fs');
var buffer = fs.readFileSync('index.html');
var outString = buffer.toString('utf8',0,buffer.length);
console.log(outString);

app.get('/', function(request, response) {
  //response.send('Hello World2!');
  response.send(outString);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
