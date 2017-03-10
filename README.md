# Mekom Solutions Jenkins contrib
<p>This project helps maintain parts of Jenkins jobs whose logic is either critical or too difficult to maintain within Jenkins itself.</p>

## 1. openmrs_monitor

<p>This openmrs_monitor subproject helps maintaining the NodeJS script behind the Jenkins <strong>openmrs_monitor</strong> job, under the form of a standalone and testable script.</p>
<p><strong>IMPORTANT:</strong> The script is only a part of the Jenkins job, and is maintainted separately as it represents a critical piece of code. It must be pasted into the <i>Execute NodeJS script</i> build step of the <i>Build</i> section.</p>

### 1.1 Overview
The script takes as input a bunch of header JSON files, each header file containing the data for one ping:
```json
{
  "datetime": "2017-03-08 15:12:22.011 +0700",
  "http_code": "200",
  "http_time_total": "2.558"
}
```
The script computes a stat point out of an array of pings, and then computes metrics across stat points that help assessing the online status of an OpenMRS instance.

### 1.2 How to run it
The repo ships with a sample pings folder. Just run
```bash
cd openmrs_monitor
sh run.sh
```

### 1.3 Inputs and parameters
Inputs are provided as environment variables, in fact as build variables of the Jenkins job:

* The location of the pings folder `pings_folder`, so the folder containing the pings to be analysed.
* The client prefix `client_prefix`, which represents an internal identifier for the OpenMRS instance under monitoring.
* The ping success rate `ping_success_rate`, that is the threshold under which the success ping rate should not descend.

### 1.4 Outputs and results

* Computes the average HTTP response time ouf ot the pings sample.
* Computes a success ping rate ouf ot the pings sample.
* Computes an average response time ouf ot the pings sample.
* Computes a weighted average ping success rate through several consecutive stat points in time up to the current stat point.
* Returns a failure code when the weighted average ping success rate goes below the provided threshold.
* Updates a stats JSON file that retains the stat points history up to an hardcoded upper limit.