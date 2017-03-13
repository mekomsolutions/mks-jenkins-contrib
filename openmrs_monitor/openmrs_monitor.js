var fs = require('fs');

//  Jenkins build params
const PINGS_FOLDER = process.env.pings_folder
const INSTANCE_ID = process.env.instance_id;
const PING_SUCCESS_RATE = 1 * process.env.ping_success_rate;

//  Other constants
const STATS_HISTORY_FILE = "./stats_history_" + INSTANCE_ID + ".json";
const STATS_HISTORY_FILE_MAX_SIZE = 100;

//
//  Adding the new supply of pings, sorted by datetime
//
var fileNames = fs.readdirSync(PINGS_FOLDER);
var pings = [];
fileNames.forEach( function(fileName) {
  var ping = JSON.parse(fs.readFileSync(PINGS_FOLDER + '/' + fileName));
  pings.push(ping);
});
if (pings.length == 0) {
  console.error("No pings sample was providing for monitoring.");
  process.exit(1);
}
pings.sort( function(a, b) {
  var dateA = new Date(a.datetime);
  var dateB = new Date(b.datetime);
  return dateA - dateB;
});

//
//  Gettings stats out of the new pings
//
var errCount = 0;
var overallTime = 0;
var firstPing = true;
pings.forEach( function(ping) {
  if (ping.http_code != '200') {
    errCount++;
  }
  if (firstPing == true) {  // We skip the first ping for latency analysis as it might be biased with authentication time
    firstPing = false;
    return;
  }
  overallTime += (1 * ping.http_time_total);  
});

//
//  Creating the latest stat point
//
var stat = {};
stat.date = new Date();
stat.sampleSize = pings.length;
stat.successRate = 1 - (errCount / pings.length);
stat.averageResponseTime = pings.length > 1 ? overallTime / (pings.length - 1) : 'NA';

//
//  Archiving the stats for further reloading
//
var stats = [];
if (fs.existsSync(STATS_HISTORY_FILE)) {
  stats = JSON.parse(fs.readFileSync(STATS_HISTORY_FILE));
}
stats.push(stat);
if (stats.length > STATS_HISTORY_FILE_MAX_SIZE) {
  stats = stats.slice(Math.max(stats.length - STATS_HISTORY_FILE_MAX_SIZE, 1))
}
fs.writeFileSync(STATS_HISTORY_FILE, JSON.stringify(stats, null, 2));

//  
//  Computing metrics over the last n stat points (based on the size of the array of weights)
//
var weights = [15, 5, 1]; // recent -> ancient
var weightSum = 0;
var avgSuccessRate = 0;
for (var i = 0; i < Math.min(stats.length, weights.length); i++) {
  avgSuccessRate += weights[i] * stats[stats.length - 1 - i].successRate;
  weightSum += weights[i];
}
avgSuccessRate /= weightSum;

//
//  Failure checks
//
if (avgSuccessRate <= PING_SUCCESS_RATE) {
  console.error("The ping success rate (" + avgSuccessRate.toFixed(3) + ") was not sufficient.");
  process.exit(1); 
}