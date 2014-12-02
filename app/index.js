"use strict";

var util = require("util");
var path = require("path");
var yeoman = require("yeoman-generator");
var yosay = require("yosay");
var uuid = require("uuid");

var AspnetProjectGenerator = yeoman.generators.Base.extend({
  initializing: function () {
    this.pkg = require("../package.json");
    this.opts = {
        uuid: uuid.v4()
    };
  },

  prompting: function () {
    var done = this.async(),
        prompts = [],
        isWin = !!require("os").platform().match(/^win/);

    // Have Yeoman greet the user.
    this.log(yosay(
      "Welcome to the good Asp.net 5 project generator!"
    ));

    prompts.push({
        type: "input",
        name: "projectName",
        message: "Please enter a project name.",
        "default": this._.capitalize(path.basename(this.env.cwd)) || "WebApplication",
    }, {
        type: "checkbox",
        name: "server",
        message: "Please select the web server.",
        choices: [{
            name: "IIS",
            value: "iis",
            checked: isWin
        }, {
            name: ".Net web listener",
            value: "weblistener",
            checked: isWin
        }, {
            name: "kestrel",
            value: "kestrel",
            checked: !isWin
        }],
        validate: function(answer){
            if(!answer.length){
                return "Please checked one or more options.";
            }
            return true;
        }
    });

    this.prompt(prompts, function(prop){
        this._.merge(this.opts, prop);
        done();
    }.bind(this));
  },

  writing: function () {
      this.dest.mkdir("wwwroot");

      this.expandFiles("**", { cwd: this.sourceRoot() }).forEach(function(file){
         if(this._.startsWith(file, "_")){
             this._tmpl(file, this._getReplacedFileName(file));
         } else {
             this.copy(file, file);
         }
     }.bind(this));
  },

  _tmpl: function(src, dest){
      this.fs.copyTpl(
          this.templatePath(src),
          this.destinationPath(dest || src),
          this.opts
      );
  },

  _getReplacedFileName: function(templateName){
      if(templateName === "_web.kproj"){
          return this.opts.projectName + ".kproj";
      }
      return templateName.replace(/^_/, "");
  },

  end: function () {

  }
});

module.exports = AspnetProjectGenerator;
