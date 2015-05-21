# git-data-extractor

A node module to extract information from git repositories. 

## Installation 

### Using NPM

```sh
	npm install git-data-extractor --save-dev 
```

### Clone git repository 

```sh
	git clone https://github.com/suhdev/git-data-extractor.git
```

## Usage

```javascript

var Git = require('git-data-extractor').Git;

var defaults = {
	tagMapper:function(tag){
		var m = tag[2].match(/v[0-9][^ \/]+[0-9]$/gm),
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

var git = new Git(defaults);

//gets the details for the repository set in the configuration 
git.getTags(); 

//to get the tags for a given repository
git.getTags(__dirname); 

//to get the tags and versions for a remote repository  
git.getTags('http://github.com/example/repo');

//to get commits summary for the current repository (set in the configuration)
git.getCommits() 

//to get commits summary for a given repository 
git.getCommits(__dirname); 

//to get repository info from URL 
git.getGitRepoInfoFromUrl(url); 

```


## Notes
1. The module uses [semantic versionsing](http://semver.org/) to extract the versions from git. This can be overriden through the configuration settings. 



---
Suhail Abood &copy; 2015

