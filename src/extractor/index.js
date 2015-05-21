var _ = require('lodash'),
	path = require('canonical-path'),
	fs = require('fs'),
	semver = require('semver'),
	shell = require('shelljs');

var Extractor = function(conf){
	var self = this;
	this.config = {
		tagMapper:function(tag){
			var m = tag[2].match(self.config.versionRegex),
				version;
			if (m && m.length > 0){
				try{
					version = semver.parse(m[0]);
				}catch(e){

				}finally{
					if (!version){
						version = {};
					}
				}
				version.shortSha = tag[0];
				version.longSha = tag[1];
				return version;
			}else {
				null;
			}
		},
		tagTransformer:function(version){
			return version;
		},
		lineMapper:function(line){
			return [line.substr(0,7),line.substr(0,40),line];
		},
		tagComparator:semver.compare,
		lineRegex:/[a-f0-9]{40}[ \t]+.*v[0-9][^ \/]*[0-9]$/gm,
		versionRegex:/v[0-9][^ \/]+[0-9]$/gm,
		gitUrl:null,
		gitRepositoryPath:null,
		packageSrc:path.join(path.dirname(require.main.filename),'package.json')

	};
	this.config = _.assign({},this.config,conf);
	if (this.config.gitRepositoryPath){
		this.config.gitUrl = this.config.gitRepositoryPath;
	}else if (this.config.gitUrl){

	}else if (fs.existsSync(this.config.packageSrc)){
		this.currentPackage = JSON.parse(require(this.config.packageSrc));
		this.config.gitUrl = this.currentPackage.git?this.currentPackage.git.url:undefined;
		if (this.config.gitUrl){
			throw new Error("the 'package.json' does not include a git repository url");
		}
	}else {
		throw new Error("neither a git repository url is provided nor a valid package.json file");
	}
};

Extractor.prototype = {
	getTags:function(repo){
		var r = repo || this.config.gitUrl;
		var result = shell.exec('git ls-remote --tags '+r);
		if (result.code === 0){
			return _(result.output.match(this.config.lineRegex))
				.map(this.config.lineMapper)
				.map(this.config.tagMapper)
				.filter()
				.map(this.config.tagTransformer)
				.sort(this.config.tagComparator)
				.value();
		}
		return [];
	},
	getCommits:function(repo){
		var r = repo || this.config.gitUrl,
			commits = [],
			commit = null;
		var result = shell.exec('git --git-dir '+r+' log');
		if (result.code === 0){
			_.forEach(result.output.match(/^.*$/gm),
				function(line){
					var m = line.match(/commit[ \t]+([a-f0-9]+)/);
					if (m && m.length > 0){
						if (commit){
							commits.push(commit);
						}
						commit = {
							commit:m[1],
							shortSha:m[1].substr(0,7),
							longSha:m[1]
						};
						return;
					}
					m = line.match(/Author:[ \t]+(.*)/);
					if (m && m.length > 0){
						commit.author = {
							full:m[1],
							name:/(.*?)</.test(m[1])?m[1].match(/(.*?)</)[1].trim():null,
							email:/<(.*?)>$/.test(m[1])?m[1].match(/<(.*?)>$/)[1].trim():null,
						};
						return;
					}
					m = line.match(/Date:[ \t]+(.*)/);
					if (m && m.length > 0){
						commit.date = m[1];
						commit.timestamp = (new Date(m[1])).getTime();
						return;
					}
					commit.message = commit.message || '';
					commit.message = commit.message.trim()+' '+line.trim();
				});

			return _(commits)
				.sortBy(function(n){
					return n.timestamp;
				})
				.value();
		}
		return [];
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