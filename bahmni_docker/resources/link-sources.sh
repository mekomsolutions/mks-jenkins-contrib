#!/bin/bash

sudo rm -r /opt/openmrs/modules
sudo ln -s /mnt/modules /opt/openmrs/modules

sudo rm /opt/openmrs/openmrs.war
sudo ln -s /mnt/war/openmrs.war /opt/openmrs/openmrs.war

sudo rm -r /opt/bahmni-web/etc/bahmni_config
sudo ln -s /mnt/bahmni_config /opt/bahmni-web/etc/bahmni_config

sudo rm -r /opt/bahmni-web/etc/bahmniapps
sudo ln -s /mnt/bahmniapps /opt/bahmni-web/etc/bahmniapps
