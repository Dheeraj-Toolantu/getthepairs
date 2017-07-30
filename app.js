var mysql = require('mysql');

var con = mysql.createConnection({
  host: "getthepair.cr1a92pwyyql.us-east-2.rds.amazonaws.com",
  user: "toolantu",
  password: "789system"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});
