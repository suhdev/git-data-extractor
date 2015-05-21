var _ = require('lodash'),
	path = require('canonical-path'),
	fs = require('fs'),
	shell = require('shelljs');

var Extractor = function(conf){
	conf = conf || {};
	this.src = conf.src || './';
	this.gitUrl = conf.gitUrl; 
	this.packageSrc = conf.packageSrc || path.join(path.dirname(require.main.filename),'package.json');
	if (!fs.existsSync(this.packageSrc) && !this.gitUrl){
		throw new Error('package.json could not be found');
	}else{
		this.currentPage = JSON.parse(require(this.packageSrc));
		this.gitUrl = this.currentPackage.git.url;
		if (!this.gitUrl){
			throw new Error("package.json does not include a git repository url");
		}
	}

	this.init();
};

Extractor.prototype = {
	init:function(){
		// this.currentPage = 
	},
	getTags:function(repo){
		var currentPackage = require('./package.json');
		var tags = shell.exec('git ls-remote --tags '+)
	},
	getGitRepoInfoFromUrl:function(repoUrl){
		var GITURL_REGEX = /^https:\/\/github.com\/([^\/]+)\/(.+).git$/;
		var match = GITURL_REGEX.exec(repoUrl);
		var git = {
			owner: match[1],
			repo: match[2]
		};
		return git;
	}

};

module.exports = Extractor;
module.exports.create = function(conf){
	return new Extractor(conf);
};