var fs = require('fs');

var repo = process.env.repo;
var branch = process.env.branch;

var envvars = "";

var project = "";
var configType = "";
var distro = "";
var server = "";

// For the specific case of '...-config-...'-like repos, the Jenkins job name is not equal to the repo name.
// Bahmni Config Jenkins job is generic but the repo is distribution specific.
if (repo.match("-config-") == "-config-") {
  project = process.env.configProject;
  repoSplit = repo.split("-");
  configType = repoSplit[0];
  distro = repoSplit[repoSplit.length - 1];
} else if (repo.match("bahmniapps") == "bahmniapps") {
  project = process.env.bahmniAppsProject;
} else if (repo.match("bahmni-connect") == "bahmni-connect") {
  project = process.env.bahmniConnectProject;
} else if (repo.match("bahmni-core") == "bahmni-core") {
  project = process.env.bahmniCoreProject;
} else if (repo.match("bahmni-offline-sync") == "bahmni-offline-sync") {
  project = process.env.bahmniOfflineSyncProject;
} else {
  // if project is not provided as input parameter, ie, the job is triggered by a parent project
  if (project == "") {
    project = process.env.openmrsModuleProject
  }
}

server = (branch == "master") ? "dev" : branch;

envvars = envvars +  "project=" + project + "\n";
envvars = envvars +  "configType=" + configType + "\n";
envvars = envvars +  "distro=" + distro + "\n";
envvars = envvars +  "server=" + server + "\n";
envvars = envvars +  "branch=" + branch + "\n";
envvars = envvars +  "organization=" + process.env.organization + "\n";
console.log(envvars);

// Export the environment variables
fs.appendFile(process.env.WORKSPACE + "/envvars", envvars, function(err) {
  if(err) {
    return console.log(err);
  }
}); 
