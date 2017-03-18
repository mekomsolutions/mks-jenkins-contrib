#!/bin/bash

sudo mv /opt/openmrs/modules/*.omod /mnt/modules/
sudo rm -r /opt/openmrs/modules
sudo ln -s /mnt/modules /opt/openmrs/modules

sudo mv /opt/openmrs/openmrs.war /mnt/war/
sudo ln -s /mnt/war/openmrs.war /opt/openmrs/openmrs.war

sudo mv /opt/bahmni-web/etc/bahmni_config/* /mnt/bahmni_config/
sudo rm -r /opt/bahmni-web/etc/bahmni_config
sudo ln -s /mnt/bahmni_config /opt/bahmni-web/etc/bahmni_config

sudo mv /opt/bahmni-web/etc/bahmniapps/* /mnt/bahmniapps/
sudo rm -r /opt/bahmni-web/etc/bahmniapps
sudo ln -s /mnt/bahmniapps /opt/bahmni-web/etc/bahmniapps
