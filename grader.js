#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var INPUTURL_DEFAULT ="http://damp-springs-8443.herokuapp.com";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    console.log('This is the htmlfile');
    console.log(fs.readFileSync(htmlfile));
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

//For html file
var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    console.log('this is the $ output from file');
    console.log($);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

//Download the url using restler and pass it to cheerio.load
var sys = require('util');
var cheerioURL = function(url, checksfile) {
    var urlResult;
    var handleResult=buildfn(url, checksfile);   
    rest.get(url).on('complete', handleResult);
    
    return cheerio.load(urlResult);
};

//build fn
var buildfn = function(url, checksfile) {
   var handleResult = function(result, response) {
      if (result instanceof Error) {
        console.log("failure");
      } else {
        console.log("success");
        $=cheerio.load(result);
        var checks = JSON.parse(fs.readFileSync(checksfile));
        var out = {};
        for(var ii in checks) {
	  var present = $(checks[ii]).length > 0;
	  out[checks[ii]] = present;
        }
        var outJson = JSON.stringify(out, null, 4);
        console.log(outJson);
	//write the outJson to a file
	fs.writeFileSync("hw3_part3_jsonFromURL.txt", outJson);
      }
   };
   return handleResult;
}
//For url
var checkURL = function(url, checksfile) {
    $ = cheerioURL(url, checksfile);
    console.log('this is the $ output from url');
    console.log($);
    /*var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    } 
    return out;*/
}


var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

/*
if(require.main == module) {
    program
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-u, --url <url>', 'Path to url', INPUTURL_DEFAULT)
        .parse(process.argv);
    console.log(program.file);
    console.log(program.url);
    if (program.file) console.log('it is a file');
    if (program.url) console.log('it is a url');
    var checkJson = checkHtmlFile(program.file, program.checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}*/

if(require.main == module) {
    program
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists))
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists))
        .option('-u, --url <url>', 'Path to url')
        .parse (process.argv);
    var checkJson;
    if (program.file){
	console.log ('Input is a file');
	checkJson = checkHtmlFile(program.file, program.checks);
	var outJson = JSON.stringify(checkJson, null, 4);
	console.log(outJson);
	fs.writeFileSync("hw3_part3_jsonFromFile.txt", outJson);
    }
    if (program.url){
	console.log ('Input is a url');
	checkJson = checkURL(program.url, program.checks);
    }
    /*var outJson = JSON.stringify(checkJson, null, 4);
    console.log('This is the output from outJson');
    console.log(outJson); */
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
