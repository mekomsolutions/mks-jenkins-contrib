#!/bin/bash

# OpenMRS modules directory
rm -rf /opt/openmrs/modules
ln -s /mnt/modules /opt/openmrs/modules
chown -h bahmni:bahmni /opt/openmrs/modules

# OWA directory
rm -rf /opt/openmrs/owa
ln -s /mnt/owa /opt/openmrs/owa
chown -h bahmni:bahmni /opt/openmrs/owa

# openmrs.war
rm /opt/openmrs/openmrs.war
ln -s /mnt/war/openmrs.war /opt/openmrs/openmrs.war
chown -h bahmni:bahmni /opt/openmrs/openmrs.war

# Bahmni config
rm -rf /opt/bahmni-web/etc/bahmni_config
ln -s /mnt/bahmni_config /opt/bahmni-web/etc/bahmni_config
chown -h bahmni:bahmni /opt/openmrs/bahmni_config

# OpenMRS config
rm -rf /opt/openmrs/configuration
ln -s /mnt/openmrs_config /opt/openmrs/configuration
chown -h bahmni:bahmni /opt/openmrs/configuration

# Bahmni Apps
rm -rf /opt/bahmni-web/etc/bahmniapps
ln -s /mnt/bahmniapps /opt/bahmni-web/etc/bahmniapps
chown -h bahmni:bahmni /opt/bahmni-web/etc/bahmniapps

# Bahmni Connect
rm -rf /opt/bahmni-offline/bahmni-connect-apps
ln -s /mnt/bahmni_connect /opt/bahmni-offline/bahmni-connect-apps
chown -h bahmni:bahmni /opt/bahmni-offline/bahmni-connect-apps

# Backups
ln -s /mnt/backups /data

# Logs
rm -rf /mnt/logs/openmrs.log
ln -s /opt/openmrs/openmrs.log /mnt/logs/openmrs.log

# Ensure correct access rights
sudo chown -R bahmni:bahmni /mnt/
