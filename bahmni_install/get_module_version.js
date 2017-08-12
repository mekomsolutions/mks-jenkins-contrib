/* This script is WIP and is supposed to extract the current module version, to then pass it to the 'distro_compare_module_version' */
/* TODO: Should implement a module specific behavior, with a specific fallback behavior on pom.xml style fetch */

// If no 'distro' is provided as parameter then go fetch the distributions that are concerned by this module
if (! process.env.distro) {
  fs = require('fs');

  var envvars = "";
  var moduleName = process.env.repo;
  var skipVersion = false;

  // For now, we only call the distro_compare_module_version with a skipVersion=true parameter
  // This will return the distributions that have dependency on the module, whatever the version
  skipVersion = true;
  var moduleVersion = getModuleVersion(moduleName);
  exportVars();

  /* TODO: Should implement a module specific behavior */
  function getModuleVersion (moduleName) {
    var version = "";
    if (moduleName == "openmrs-module-bahmniapps") {
      // Bahmni Apps is not a maven project. No pom.xml.
      // Implement Bahmni Apps specfic behavior to retrieve its curent version
      // TODO: retreive the Bahmni Apps module version --
    } else {
      // TODO: implement the default behavior, ie, fetch the pom.xml and read the version
    }
    return version;
  }

  /* Export environment variables */
  function exportVars () {
    envvars = envvars +  "moduleName=" + moduleName + "\n";
    envvars = envvars +  "moduleVersion=" + moduleVersion + "\n";
    envvars = envvars +  "skipVersion=" + skipVersion + "\n";
    fs.appendFile(process.env.WORKSPACE + "/envvars", envvars, function(err) {
      if(err) {
        return console.log(err);
      }
    });
  }
}
