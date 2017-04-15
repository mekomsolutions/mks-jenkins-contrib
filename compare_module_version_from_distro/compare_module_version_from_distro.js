xml2js = require('xml2js'),
fs = require('fs');

// TODO: This job is simply not run for now, and it always return true
// There is no distro repository at all at the moment
// Once a distro repository is created, we can make Jenkins tasks to fetch it (or them if there is more than one)
// And set the 'distroRepos' list based on all 'bahmni-distro'-like folders
console.log("TODO: No distro currently exists. Always returning 'cambodia'");
var matchingDistros = "cambodia";
exportVars();


// TODO: This is the hardcoded list of distributions to scan through. Find a way for better distro list management
/* 
var distroRepos = [];
distroRepos.push("bahmni-distro-cambodia");
distroRepos.push("bahmni-distro-laos");

var matchingDistros = [];

// Additionnal paramater to only check if the module is present in the pom, without checking the version
var skipVersion = process.env.skipVersion;
var moduleName = process.env.moduleName;
var moduleVersion = process.env.moduleVersion;

// Retrieve the module short name in order to look it up in each distro pom.xml
var moduleNameSplit = moduleName.split("-");
var moduleShortName = moduleNameSplit[moduleNameSplit.length -1];

// Iterate into each distribution repository
distroRepos.forEach(function (repo) {

  var parser = new xml2js.Parser();
  var repoPath = process.env.WORKSPACE + "/" + repo
  var pomPath = repoPath + "/pom.xml"

  fs.readFile(pomPath, function(err, data) {
    parser.parseString(data, function (err, result) {
      // Parse the pom.xml in the current distro repository
      var matches = false
      console.log("## " + repo + " ##");
      // Verify if the module is found in the distro pom.xml
      if (result.project.properties[0][moduleShortName + "Version"] == null ) {
        console.log("No dependency to '" + moduleShortName + "' found in pom file. (" + repoPath + "/pom.xml)")
        console.log("Skipping this repository...")
      } else {
        if (skipVersion) {
          matches = true;
        } else {
        // if found, then compare its version with the module version to be deployed
          matches = compareVersion(result, moduleShortName, moduleVersion, repo);
        }
      }
      if (matches) {
        var repoSplit = repo.split("-")
        var matchingDistro = repoSplit[repoSplit.length - 1];  
        matchingDistros.push(matchingDistro);
      }
    })
    exportVars();
  })  
}
)
*/


/* Compares the version of a given module */
/*
function compareVersion(pomObject, moduleShortName ,versionToCompare, repo) {
  var versionFromPom = pomObject.project.properties[0][moduleShortName + "Version"][0];
  console.log("'" + moduleShortName + "' has been found in the distro pom.xml. Version=" + versionFromPom)
  console.log("Version of module from repo: " + version) 
  if (versionFromPom == versionToCompare) {
    console.log("Module version and version in distro pom.xml match!")
    return true;
  } else {
    console.log("Module version and version in distro pom.xml do not match. Skip adding " + repo + " as a distro to deploy")
    return false;
  }
}
*/

/* Export environment variables */
function exportVars () {
  var envvars = "";
  envvars = envvars +  "distros=" + matchingDistros + "\n";
  fs.writeFile(process.env.WORKSPACE + "/envvars", envvars, function(err) {
    if(err) {
      return console.log(err);
    }
    process.exit(0);
  });
}
