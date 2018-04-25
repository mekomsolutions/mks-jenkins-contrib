import os
import sys
from subprocess import call
import shutil
import click
import docker
import git
from jinja2 import Environment, FileSystemLoader

@click.command()
@click.option('--skip_container', is_flag=True, help="Skip the creation of the Bahmni container - in case it already exists")
@click.option('--skip_ansible', is_flag=True, help="Skip the Ansible installer on the Bahmni container - used for debug mostly")
@click.option('--yes', '-y', is_flag=True, help="Answer 'yes' to user prompts - used to run the script programmatically")
@click.argument('distribution')


def setup(skip_container, skip_ansible, yes, distribution):

	"""This script prepares a Bahmni docker image for a specific DISTRIBUTION, to be used as a base to deploy new docker containers."""
	docker_Username = os.environ.get("DOCKER_USER") or "mekomsolutions"
	if not os.environ.get("DOCKER_PASSWORD"):
		click.echo('[ERROR] No DOCKER_PASSWORD environment variable found. Please set one to later commit your Docker image on remote Docker repository. Docker username is \'%s\'.' %docker_Username )
	if yes and not os.environ.get("DOCKER_PASSWORD"):
		click.echo('[ERROR] \'-y (--yes)\' option is provided but no DOCKER_PASSWORD environment variable found. Please set DOCKER_PASSWORD. Aborting...')
		sys.exit(1)

	container_Name = "bahmni"
	hostname = "bahmni"
	base_Image_Name="centos:6.9"
	client = docker.from_env()

	# Retrieve Git Bahmni Playbooks repo version
	ansible_Home = os.environ.get('HOME') + '/repos/bahmni-playbooks'
	ansible_Repo = git.Repo(ansible_Home)
	assert not ansible_Repo.bare
	
	# Retrieve Git MKS Contrib repo version
	contrib_Home = os.environ.get('HOME') + '/repos/mks-jenkins-contrib'
	contrib_Repo = git.Repo(contrib_Home)
	assert not contrib_Repo.bare
	
	version = "%s-%s-%s" % (ansible_Repo.head.reference, ansible_Repo.head.commit.hexsha[:7], contrib_Repo.head.commit.hexsha[:7])

	if not skip_container:
		# Build a temporary image
		click.echo('Building a new temporary Docker image with appropriate files for this distribution...')
	
		if os.path.exists('/tmp/bahmni-build'):
			shutil.rmtree('/tmp/bahmni-build')

		os.mkdir('/tmp/bahmni-build')
		shutil.copyfile('./resources/link-mounted-folders.sh', '/tmp/bahmni-build/link-mounted-folders.sh')
		shutil.copyfile('./resources/update-apache-config.sh', '/tmp/bahmni-build/update-apache-config.sh')
		shutil.copyfile('./resources/move-mysql-datadir.sh', '/tmp/bahmni-build/move-mysql-datadir.sh')
		shutil.copyfile('./resources/%s.setup.yml' % distribution, '/tmp/bahmni-build/%s.setup.yml' % distribution)

		# Render the Jinja2 inventory file to be copied on the container
		local_Inventory = renderJinja2Inventoryfile(distribution, "localhost")
		with open("/tmp/bahmni-build/%s-local.inventory" % distribution, "w") as text_file:
	       	    text_file.write(local_Inventory)


		# Render the Jinja2 Dockerfile with appropriate values
		renderJinja2Dockerfile(distribution, base_Image_Name)

		distro_Image = client.images.build(path='/tmp/bahmni-build')[0]
		click.echo(distro_Image.id[8:21])

		click.echo("Starting new Bahmni temporary container based on '%s' Docker image..." % distro_Image.id[8:21])
		bahmni_Container = client.containers.run(distro_Image.id, hostname=hostname, name=container_Name, tty=True, stdin_open=True, detach=True)
	else:
		click.echo('Skipping temporary Docker container creation...')
		try:
			bahmni_Container = client.containers.get(container_Name)
		except docker.errors.NotFound:
			click.echo("'%s' Docker container not found. Try not to use '--skip_container' option. Aborting..." % container_Name)
			sys.exit()

	if not skip_ansible:
		container_Inventory = renderJinja2Inventoryfile(distribution, bahmni_Container.name)
	        with open("%s/%s.inventory" %  (ansible_Home, distribution), "w") as text_file:
       		     text_file.write(container_Inventory)

		ansible_Command="cd %s && ansible-playbook -i %s.inventory all.yml --skip-tags 'selinux,iptables' --extra-vars 'docker=true' --extra-vars '@/tmp/bahmni-build/%s.setup.yml' --extra-vars '@/etc/bahmni-installer/rpm_versions.yml'" % (ansible_Home, distribution, distribution)
		click.echo(ansible_Command)

		call(ansible_Command, shell=True)

	if not yes:
		if click.confirm("Do you wish to locally commit the '%s' container as '%s/%s:%s-%s' Docker image?" % (container_Name, docker_Username, container_Name, distribution, version)):
			commit_Image(docker_Username, bahmni_Container, distribution, version)
			if click.confirm("Do you wish to locally commit the '%s' container as '%s/%s:%s-latest' Docker image?" % (container_Name, docker_Username, container_Name, distribution)):
				commit_Image(docker_Username, bahmni_Container, distribution, "latest")
			if click.confirm("Do you wish to push the newly created '%s/%s:%s-%s' Docker image to remote repository?" % (docker_Username, container_Name, distribution, version)):
				push_Image(client, docker_Username, bahmni_Container, distribution, version)
			if click.confirm("Do you wish to push the newly created '%s/%s:%s-latest' Docker image to remote repository?" % (docker_Username, container_Name, distribution)):
				push_Image(client, docker_Username, bahmni_Container, distribution, "latest")
			if click.confirm("Do you wish to destroy the '%s' temporary container" % container_Name):
				destroy_Container(bahmni_Container)
	else:
		commit_Image(docker_Username, bahmni_Container, distribution, version)
		push_Image(client, docker_Username, bahmni_Container, distribution, version)
		destroy_Container(bahmni_Container)

def commit_Image(username, container, distribution, version):
		click.echo("Commiting image %s/%s:%s-%s'..." % (username, container.name, distribution, version))
		container.commit('%s/%s' % (username, container.name), tag="%s-%s" % (distribution, version))
		
def push_Image(client, username, container, distribution, version):
		client.login(username, os.environ.get("DOCKER_PASSWORD"))
		click.echo("Pushing image %s/%s:%s-%s'..." % (username, container.name, distribution, version))
		client.images.push('%s/%s' % (username, container.name), tag="%s-%s" % (distribution, version))

def destroy_Container(container):
		click.echo("Destroying the '%s' container..." % container.name)
		container.remove(v=True, force=True)

def renderJinja2Dockerfile(distribution, image_Name):
	THIS_DIR = os.path.dirname(os.path.abspath(__file__))
        j2_env = Environment(loader=FileSystemLoader(THIS_DIR),
                         trim_blocks=True)
	dockerfile_Str = j2_env.get_template('resources/Dockerfile.j2').render(
                distribution=distribution, image=image_Name
        )
	with open("/tmp/bahmni-build/Dockerfile", "w") as text_file:
	    text_file.write(dockerfile_Str)

def renderJinja2Inventoryfile(distribution, hostname):
	THIS_DIR = os.path.dirname(os.path.abspath(__file__))
        j2_env = Environment(loader=FileSystemLoader(THIS_DIR),
                         trim_blocks=True)

	# Ensure that 'localhost' does not connect using 'docker' connection type
	if hostname ==  "localhost":
		connection_Type = "local"
	else:
		connection_Type = "docker"

        inventory_Str = j2_env.get_template('resources/inventories/%s.inventory.j2' % distribution).render(
                hostname=hostname, connection_Type=connection_Type
        )
	return inventory_Str


if __name__ == '__main__':
	setup()
