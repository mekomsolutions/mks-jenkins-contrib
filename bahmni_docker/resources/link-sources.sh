#!/bin/bash

# Modules directory
sudo rm -r /opt/openmrs/modules
sudo ln -s /mnt/modules /opt/openmrs/modules

# openmrs.war
sudo rm /opt/openmrs/openmrs.war
sudo ln -s /mnt/war/openmrs.war /opt/openmrs/openmrs.war

# Bahmni config
sudo rm -r /opt/bahmni-web/etc/bahmni_config
sudo ln -s /mnt/bahmni_config /opt/bahmni-web/etc/bahmni_config

# OpenMRS config
sudo rm -r /opt/openmrs/configuration
sudo ln -s /mnt/openmrs_config /opt/openmrs/configuration

# Bahmni Apps
sudo rm -r /opt/bahmni-web/etc/bahmniapps
sudo ln -s /mnt/bahmniapps /opt/bahmni-web/etc/bahmniapps

# Logs
sudo rm -r /mnt/logs/openmrs.log
sudo ln -s /opt/openmrs/openmrs.log /mnt/logs/openmrs.log
