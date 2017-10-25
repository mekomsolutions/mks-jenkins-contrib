# Creating a new Bahmni Docker image

## When to build a new Bahmni image?

One should build at least one image per Bahmni distribution (of a given Bahmni version)
A distribution will likely have its own Bahmni components to install, so this is why we prepare an image with the appropriate components installed.

Note that in this context, 'component' refers to a component as it is in the Ansible inventory file: 'bahmni-emr', 'bahmni-emr-db', 'bahmni-connect'

A image is also bound to a specfic Bahmni version. So anytime you need to use a new version of a given distribution, a new image will have to be created for it.


## How to build a new Bahmni image?


Because some components of the Dockerfile are dynamically used, we can not simply build the container from it.
The [prepare-bahmni-image.py](./prepare-bahmni-image.py) will take care of that and also run the needed commands to install Bahmni on the container

So what you will need to provide is the appropriate templated inventory file, named after your distribution name, as well as the **setup.yml** file for this distribution.

You can use an existing file to create your own inventory file.
For instance, the [inventories/cambodia.inventory.j2](./inventories/cambodia.inventory.j2)
The same applies with the setup.yml file. You can copy it from [cambodia.setup.yml](./cambodia.setup.yml) and modify according to your distro details.

Once you have created your own inventory file and setup.yml file, you can run the prepare-bahmni-image.py script with following command:
```
cd ~/repos/mks-jenkins-contrib/bahmni_docker/
python prepare-bahmni-image.py cambodia
```
where 'cambodia' should be replaced by the name of your distribution

