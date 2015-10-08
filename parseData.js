var fs = require("fs");

// //Converter Class
// var Converter = require("csvtojson").Converter;
// var converter = new Converter({});
//
// //end_parsed will be emitted once parsing finished
// converter.on("end_parsed", function (jsonArray) {
//   var result = "module.exports = " + JSON.stringify(jsonArray);
//   fs.writeFile("test.js", result, function(err) {
//     if (err) throw err;
//     console.log("created input json");
//   });
// });
//
// //read from file
// fs.createReadStream("./test.csv").pipe(converter);


fs.readFile('./test.csv', 'utf8', function(err, csvData) {
  if (err) throw err;
  // console.log(csvData);
  parse(csvData);
});

function parse(csvData) {
  var rows = csvData.split('\r\n').map(function(row) {
    return row.split(',');
  });

  var result = "module.exports = " + JSON.stringify(rows);
  fs.writeFile("test.js", result, function(err) {
    if (err) throw err;
    console.log("created input json");
  });

  // TODO: further parse - create header and type arrays, convert latency to int and timeOnPage to float
  // var headers = rows[0].map(function(header) {
  //   return header.split(' ')[0];
  // });
  // var types = rows[0].map(function(header) {
  //   var typeWithParens = header.split(' ')[1]
  //   return typeWithParens.substring(1, typeWithParens.length-2);
  // });
  // console.log(headers, types);
  // if (rows[rows.length-1].length === 1) rows.pop();
  // console.log(rows);
}

// TODO: Calculate stats
