#!/bin/bash

export pings_folder=pings
export instance_id=lfhc
export ping_success_rate=0.92

nodejs openmrs_monitor.js && echo "The NodeJS script ran successfully."