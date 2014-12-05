"use strict";

var util = require("util");
var path = require("path");
var yeoman = require("yeoman-generator");
var yosay = require("yosay");
var uuid = require("uuid");

var AspnetProjectGenerator = yeoman.generators.Base.extend({
    initializing: function() {
        this.pkg = require("../package.json");
        this.opts = {
            uuid: uuid.v4()
        };
    },

    prompting: function() {
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
            message: "Please select the web servers.",
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
            validate: function(answer) {
                if (!answer.length) {
                    return "Please checked one or more options.";
                }
                return true;
            }
        }, {
            type: "checkbox",
            name: "framework",
            message: "Please select the frameworks / libraries / tools.",
            choices: [{
                name: "MVC",
                value: "mvc",
                checked: true
            }]
        });

        this.prompt(prompts, function(prop) {
            this._.merge(this.opts, prop);
            done();
        }.bind(this));
    },

    writing: function() {
        this.dest.mkdir("wwwroot");

        if(this.opts.framework.indexOf("mvc") > -1){
            this.dest.mkdir("controllers");
            this.dest.mkdir("views");
            this.dest.mkdir("models");
        }
        
        this.expandFiles("**", {
            cwd: this.sourceRoot()
        }).forEach(function(file) {
            if (this._.startsWith(file, "_")) {
                this._tmpl(file, this._getReplacedFileName(file));
            } else {
                this.copy(file, file);
            }
        }.bind(this));

        this.fs.write("project.json", this._buildProjectJson());
    },

    _tmpl: function(src, dest) {
        this.fs.copyTpl(
            this.templatePath(src),
            this.destinationPath(dest || src),
            this.opts
        );
    },

    _getReplacedFileName: function(templateName) {
        if (templateName === "_web.kproj") {
            return this.opts.projectName + ".kproj";
        }
        return templateName.replace(/^_/, "");
    },

    _buildProjectJson: function() {
        var projectJson = {
            version: "1.0.0-*",
            webroot: "wwwroot",
            exclude: ["wwwroot"],
            packExclude: ["**.kproj", "**.user"],
            dependencies: {
                "Microsoft.AspNet.StaticFiles": "1.0.0-beta1",
                "Microsoft.Framework.ConfigurationModel.Json": "1.0.0-beta1",
                "Microsoft.AspNet.Hosting": "1.0.0-beta1"
            },
            commands: {},
            frameworks: {
                aspnet50: {},
                aspnetcore50: {}
            }
        };

        if(this.opts.server.indexOf("weblistener") > -1) {
            projectJson = this._.merge(projectJson, {
                dependencies: {
                    "Microsoft.AspNet.Server.WebListener": "1.0.0-beta1"
                },
                commands: {
                    "web": "Microsoft.AspNet.Hosting --server Microsoft.AspNet.Server.WebListener --server.urls http://localhost:5001"
                }
            });
        }

        if(this.opts.server.indexOf("kestrel") > -1) {
            projectJson = this._.merge(projectJson, {
                dependencies: {
                    "kestrel": "1.0.0-*"
                },
                commands: {
                    "kestrel": "Microsoft.AspNet.Hosting --server Kestrel --server.urls http://localhost:5001"
                }
            });
        }

        if(this.opts.server.indexOf("iis") > -1) {
            projectJson = this._.merge(projectJson, {
                dependencies: {
                    "Microsoft.AspNet.Server.IIS": "1.0.0-beta1"
                }
            });
        }

        if(this.opts.framework.indexOf("mvc") > -1){
            projectJson = this._.merge(projectJson, {
                dependencies: {
                    "Microsoft.AspNet.Mvc": "6.0.0-beta1",
                    "Microsoft.Framework.CodeGenerators.Mvc": "1.0.0-beta1"
                },
                commands: {
                    "gen": "Microsoft.Framework.CodeGeneration"
                }
            });
        }

        return JSON.stringify(projectJson, null, "    ");
    },

    end: function() {

    }
});

module.exports = AspnetProjectGenerator;
