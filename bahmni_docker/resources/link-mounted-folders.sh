#!/bin/bash

# OpenMRS modules directory
rm -rf /opt/openmrs/modules
ln -s /mnt/modules /opt/openmrs/modules
chown -R bahmni:bahmni /mnt/modules

# OWA directory
rm -rf /opt/openmrs/owa
ln -s /mnt/owa /opt/openmrs/owa
chown -R bahmni:bahmni /mnt/owa

# openmrs.war
rm -rf /opt/openmrs/openmrs.war
ln -s /mnt/war/openmrs.war /opt/openmrs/openmrs.war
chown -R bahmni:bahmni /mnt/war/openmrs.war

# Bahmni config
rm -rf /opt/bahmni-web/etc/bahmni_config
ln -s /mnt/bahmni_config /opt/bahmni-web/etc/bahmni_config
chown -R bahmni:bahmni /mnt/bahmni_config

# OpenMRS config
rm -rf /opt/openmrs/configuration
ln -s /mnt/openmrs_config /opt/openmrs/configuration
chown -R bahmni:bahmni /mnt/openmrs_config

# Bahmni Apps
rm -rf /opt/bahmni-web/etc/bahmniapps
ln -s /mnt/bahmniapps /opt/bahmni-web/etc/bahmniapps
chown -R bahmni:bahmni /mnt/bahmniapps

# Bahmni Connect
rm -rf /opt/bahmni-offline/bahmni-connect-apps
ln -s /mnt/bahmni_connect /opt/bahmni-offline/bahmni-connect-apps
chown -R bahmni:bahmni /mnt/bahmni_connect

# Database dump
ln -s /mnt/data/db_dumps /data
chown -R bahmni:bahmni /mnt/data/db_dumps

# Bahmni Home
rm -rf /home/bahmni
ln -s /mnt/data/bahmni_home /home/bahmni
chown -R bahmni:bahmni /mnt/data/bahmni_home

# Configuration Checksums folder
ln -s /mnt/data/configuration_checksums /opt/openmrs/
chown -R bahmni:bahmni /mnt/data/configuration_checksums

# Logs
echo "" > /opt/openmrs/openmrs.log
chown -R bahmni:bahmni /mnt/logs/
rm -f /mnt/logs/openmrs.log
ln -s /opt/openmrs/openmrs.log /mnt/logs