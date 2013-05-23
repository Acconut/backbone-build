#!/usr/bin/env node

var argv = require("optimist").argv,
    uglify = require("uglify-js"),
    path = require("path"),
    fs = require("fs");

// Directory containing all snippets
var dir = path.join(__dirname, "../src/");

// Intro and outro file
var intro = dir + "intro.js",
    outro = dir + "outro.js";

// Dependencies
var parts = {
    "events": [
    
    ],
    "model": [
        "events"
    ],
    "collection": [
        "events",
        "model"
    ],
    "view": [
        "events"
    ],
    "sync": [
        "model"
    ],
    "router":[
        "events",
        "history"
    ],
    "history": [
        "events"
    ]
};

var include = argv.i || argv.include,
    exclude = argv.e || argv.exclude,
    minify  = argv.m || argv.minify  || false,
    output  = argv.o || argv.output  || "backbone.js";

var needed = [];

if(include){
    needed = include.split(",");
} else if(exclude) {
    var e = exclude.split(",");
    for(var i in parts) {
        if(!(i in e)) needed.push(i); 
    }
} else {
    console.log([
        "Use `build <options>`.",
        "",
        "\t--include or -i: Snippets to be included seperated by comma",
        "\t--exclude or -e: Snippets to be excluded separated by comma",
        "\t--minify  or -m: Minify output using uglify.js",
        "\t--outout  or -o: Where to put the generated code",
        "",
        "Example:",
        "\tbuild -i router,sync -o mybackbone.js -m",
        "",
        "Backbone version: 1.0.0",
        "",
        "Available snippets are:",
        "\t" + Object.keys(parts).join("\n\t")
    ].join("\n"));
    
    process.exit(1);
}

console.log("Snippets specified by you: %s\n", needed.join(", "));

for(var i = 0; i < needed.length; i++) {
    var n = needed[i];
    if(!(n in parts)) {
        console.log("Unknown snippet %s!", n);
        process.exit(1);
    }
    for(var j = 0; j < parts[n].length; j++) {
        var k = parts[n][j];
        if(needed.indexOf(k) === -1) needed.push(k);
    }
}

console.log("\nFollowing snippets must be included: %s\n", needed.join(", "));

output = path.join(process.cwd(), output);
console.log("Generated code is going to be put in: \n%s", output);

console.log("\nProcessing Intro...");
var gen = fs.readFileSync(intro).toString();

for(var i in parts) {
    if(needed.indexOf(i) !== -1) {
        console.log("Processing %s...", i);
        gen += fs.readFileSync(dir + i + ".js").toString();
    }
}

console.log("Processing Outro...\n");
gen += fs.readFileSync(outro).toString();

if(minify) {
    console.log("Minifying...");
    gen = uglify.minify(gen, { fromString: true }).code;
}

console.log("\nDone!");

fs.writeFileSync(output, gen, {
    flag: "w+"
});