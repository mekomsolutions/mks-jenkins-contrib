#!/bin/bash
set -e

version=`cd $HOME/repos/bahmni-playbooks/ && git branch | grep \* | cut -d ' ' -f2`
name="bahmni/$1"
container_name="bahmni"
pwd=$PWD
ansible_home=$HOME/repos/bahmni-playbooks

startNewContainer () {
	echo "Starting new Bahmni empty container based on bahmni/centos'... "
	docker run -it -h bahmni --name $container_name -d bahmni/centos:6.8
}

if [[ -z $1 ]]
then
    	echo "Please provide an implementation name. Exiting..."
	exit 1
fi

if [ "$2" != "-s" ]
then
	startNewContainer
fi

echo "Copying inventroy file"
cp $pwd/resources/$1.inventory $ansible_home/$1.inventory -v

ansible_command="cd $ansible_home && ansible-playbook -i $1.inventory all.yml --skip-tags 'selinux,iptables' --extra-vars '@/etc/bahmni-installer/setup.yml' --extra-vars '@/etc/bahmni-installer/rpm_versions.yml'"

echo "Running Ansible installer on the new container..."
echo $ansible_command
eval $ansible_command

echo "Provision the container with useful scripts and files..."
docker cp $pwd/resources/move-sources.sh $container_name:/etc/bahmni-installer/
docker cp $pwd/resources/local.inventory $container_name:/etc/bahmni-installer/local

echo -n "Do you wish to commit this container as '$name:$version' Docker image? [y/n] (This will also termniate the '$container_name')"
read answer
if echo "$answer" | grep -iq "^y" ;then
	echo "Commiting image $name:$version"
	docker commit $container_name $name:$version
	echo "Destroying the '$container_name' container"
	docker rm -vf $container_name

else
	exit;
fi

exit 0
