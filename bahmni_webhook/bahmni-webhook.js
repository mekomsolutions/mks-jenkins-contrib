var fs = require('fs');

var envvars = "";

// For testing/dev purpose, run 'export payload=$(cat payload_example.json)' in your shell to init the payload environment var
var payloadString = process.env.payload

// If no payload was received there is nothing to do. Not allowed to use "null".
if (payloadString === "") { // This assume the default payload parameter value is "". Not allowed to use "null".
  return 0;
}

// Parse JSON and save
var payloadObject = JSON.parse(payloadString);

// Export the repo name
var repo = payloadObject.repository
envvars = envvars + "repo=" + repo.name + "\n";

// Export the branch name
if (payloadObject.ref != null) {
var refPath = payloadObject.ref.split("/");
var branch = refPath[refPath.length - 1];
envvars = envvars + "branch=" + branch + "\n";
} else {
  process.exit(0);
}

// Export the commit number if present, otherwise, exit
if (payloadObject.head_commit != null) {
  var commit = payloadObject.head_commit.id.slice(0, 7);
  envvars = envvars + "commit=" + commit + "\n";
} else {
  process.exit(0);
}

// Export the environment variables
fs.writeFile(process.env.WORKSPACE + "/envvars", envvars, function(err) {
  if(err) {
    return console.log(err);
  }
}); 