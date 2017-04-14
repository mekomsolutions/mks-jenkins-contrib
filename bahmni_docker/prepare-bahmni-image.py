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
@click.option('--skip_database', is_flag=True, help="Skip the database restore on the Bahmni container - used for debug mostly")
@click.option('--yes', '-y', is_flag=True, help="Answer 'yes' to user prompts - used to run the script programmatically")
@click.argument('distribution')


def setup(skip_container, skip_ansible, skip_database, yes, distribution):

	"""This script prepares a Bahmni docker image for a specific DISTRIBUTION, to be used as a base to deploy new docker containers."""

	container_Name = "bahmni"
	hostname = "bahmni"
	image_Name="bahmni/centos:6.8"

	# Retrieve Git Bahmni PLaybooks repo version
	ansible_Home = os.environ['HOME'] + '/repos/bahmni-playbooks'
	repo = git.Repo(ansible_Home)
	assert not repo.bare
	version=repo.head.reference

	client = docker.from_env()

	if  not skip_container:
		# Build a temporary image
		click.echo('Building a new temporary Docker image with appropriate files for this distribution...')
	
		if os.path.exists('/tmp/bahmni-build'):
			shutil.rmtree('/tmp/bahmni-build')

		os.mkdir('/tmp/bahmni-build')
		shutil.copyfile('./resources/link-sources.sh', '/tmp/bahmni-build/link-sources.sh')
		shutil.copyfile('./resources/%s_openmrs_base.sql.gz' % distribution, '/tmp/bahmni-build/%s_openmrs_base.sql.gz' % distribution)

		# Render the Jinja2 inventory file to be copied on the container
		local_Inventory = renderJinja2Inventoryfile(distribution, "localhost")
		with open("/tmp/bahmni-build/%s-local.inventory" % distribution, "w") as text_file:
	       	    text_file.write(local_Inventory)


		# Render the Jinja2 Dockerfile with appropirate values
		renderJinja2Dockerfile(distribution, image_Name)

		distro_Image = client.images.build(path='/tmp/bahmni-build')
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

		ansible_Command="cd %s && ansible-playbook -i %s.inventory all.yml --skip-tags 'selinux,iptables' --extra-vars '@/etc/bahmni-installer/setup.yml' --extra-vars '@/etc/bahmni-installer/rpm_versions.yml'" % (ansible_Home, distribution)
		click.echo(ansible_Command)

		call(ansible_Command, shell=True)
	
	if not skip_database:
		openmrs_DB = "openmrs_base.sql.gz"
		click.echo("Execute database restore based on '%s:/data/openmrs/%s'... (previously copied from './resources/%s_%s)" % (bahmni_Container.name, openmrs_DB, distribution, openmrs_DB))
		bahmni_Container.exec_run('sudo bahmni -i local.inventory restore --restore_type=db --options=openmrs --strategy=dump --restore_point=%s' % openmrs_DB)
	if not yes:
		if click.confirm("Do you wish to commit this container as '%s/%s:%s' Docker image? ('%s' container will be terminated)" % (container_Name, distribution, version, container_Name)):
			commit_Image(bahmni_Container, distribution, version)
	else:
		commit_Image(bahmni_Container, distribution, version)
		

def commit_Image(container, distribution, version):
		click.echo("Commiting image '%s/%s:%s'..." % (container.name, distribution, version))
		container.commit('%s/%s' % (container.name, distribution), tag=version)
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

        inventory_Str = j2_env.get_template('resources/%s.inventory.j2' % distribution).render(
                hostname=hostname, connection_Type=connection_Type
        )
	return inventory_Str


if __name__ == '__main__':
	setup()