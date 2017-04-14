#!/bin/bash

# Modules directory
rm -r /opt/openmrs/modules
ln -s /mnt/modules /opt/openmrs/modules
chown -h bahmni:bahmni /opt/openmrs/modules

# openmrs.war
rm /opt/openmrs/openmrs.war
ln -s /mnt/war/openmrs.war /opt/openmrs/openmrs.war
chown -h bahmni:bahmni /opt/openmrs/openmrs.war

# Bahmni config
rm -r /opt/bahmni-web/etc/bahmni_config
ln -s /mnt/bahmni_config /opt/bahmni-web/etc/bahmni_config
chown -h bahmni:bahmni /opt/openmrs/bahmni_config

# OpenMRS config
rm -r /opt/openmrs/configuration
ln -s /mnt/openmrs_config /opt/openmrs/configuration
chown -h bahmni:bahmni /opt/openmrs/configuration

# Bahmni Apps
rm -r /opt/bahmni-web/etc/bahmniapps
ln -s /mnt/bahmniapps /opt/bahmni-web/etc/bahmniapps
chown -h bahmni:bahmni /opt/bahmni-web/etc/bahmniapps

# Logs
rm -r /opt/openmrs/openmrs.log
rm -r /mnt/logs/openmrs.log
touch /mnt/logs/openmrs.log
ln -s /mnt/logs/openmrs.log /opt/openmrs/openmrs.log
chown -h bahmni:bahmni /opt/openmrs/openmrs.log

# Ensure correct access rights
sudo chown -R bahmni:bahmni /mnt/
