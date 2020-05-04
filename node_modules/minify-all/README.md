# Minify-All

A function that minifies your javascript or css files, and all the javascript or css files in your nested folders as well. **Minify-All** can be used as a CLI or can be run in your code. By giving it a directory, Minify-All will walk through the depth of your folders and minify all the javascript that it sees.

### Installation

    > npm install -g minify-all 

### Run CLI

    > minify-all [folder] [compression type]

### Run in your code
`minifyAll` function has 3 parts: directory, options, and callback, such that

    minifyAll([directory], [options], [callback])

The callback outputs 2 options:
* **error**: the error of each file
* **minified**: the output of the minified file

##### Example

    var minifyAll = require("minify-all");
    
    minifyAll("./", { silent: true }, function(err){
        if(err){
            console.log(err);
        }
    });

### Options

* **silent**
If silent mode is on, then logs of which files has been found won't be displayed

* **type**
Determines the compression type the file should be put through. As **Minify-All** depends on **node-minify**, these types are defined by **node-minify** and can be found [here](https://www.npmjs.com/package/node-minify). If a type is not specified, then by default it is *uglifyjs*
