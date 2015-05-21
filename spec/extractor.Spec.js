var path = require('canonical-path');
describe("Extractor Suite", function() {
	var Extractor = require('../src/extractor');
	it("should throw an error if package.json could not be found and git url is not set",function(){
		var conf = {
			packageSrc:path.join(__dirname,'package.json')
		};
		expect(function(){
			new Extractor(conf);
		}).toThrow();
	});

	it("should not throw exception if git url is passed in the configuration",function(){
		var conf = {
			gitUrl: 'https://github.com/suhdev/git-data-extractor.git'
		};
		expect(function(){
			new Extractor(conf);
		}).not.toThrow();
	});

	it("should get all tags of a remote git repo",function(){
		
	});
});