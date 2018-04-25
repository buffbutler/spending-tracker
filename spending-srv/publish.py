import os
import shutil
import zipfile
import sys
import subprocess

# the point of this file is to be able to quickly redploy the site after changes have been made
# such that the deployment process isn't manual

# deployment constraints
# we don't touch the user files or the database
# we don't touch the settings.py
# we have to run collect static
# we assume the directory permissions on the parent are correct

# SETTINGS

# simple script to copy out the files to the server mount point

# these need to be set
mount_root = "<root application directory>"
temp_root = "<temporary directory>"
venv = "<virtual env to trigger collectstatic>"

# derrived
archive_source = os.path.realpath(sys.argv[1])
settings_file = os.path.join(mount_root, 'server/settings.py')
static_root = os.path.join(mount_root, "static")

# WORKFLOW

print("===")
print("mount: {0}".format(mount_root))
print("temp: {0}".format(temp_root))
print("source: {0}".format(archive_source))
print("settings: {0}".format(settings_file))
print("venv: {0}".format(venv))
print("static: {0}".format(static_root))
print("===")

if len(sys.argv) <= 1:
    print("A source file is not specified")
    exit()

settings_backed_up = False

# backup the settings file
if os.path.exists(settings_file):
    shutil.copy(settings_file, temp_root)
    settings_backed_up = True

# wipe out the mount tree

print("itterating:{0}".format(mount_root))

for source_file_name in os.listdir(mount_root):
    if not source_file_name.startswith(".."):
        print("  removing:{0}".format(source_file_name))
        # for some reason python is including ..\userfiles

        full_source_file_name = os.path.join(mount_root, source_file_name)

        if os.path.isfile(full_source_file_name):
            os.remove(full_source_file_name)
        else:
            shutil.rmtree(full_source_file_name)

# extract the archive
print("inflating package")

with zipfile.ZipFile(archive_source) as zip_archive:
    zip_archive.extractall(mount_root)

# if a settings file was not backed up then move a new one there... the next line we modify it
if not settings_backed_up:
    shutil.copy(settings_file, temp_root)

# append the static stuff to the settings file
print("modifying static file")

with open(settings_file, "a") as settings_file_w:
    settings_file_w.write("\n")
    settings_file_w.write('STATIC_ROOT = "{0}"'.format(static_root))

# get our static files
if not os.path.exists(static_root):
    os.makedirs(static_root)

ember_build = subprocess.Popen(". {0};python3 manage.py collectstatic".format(venv), cwd=mount_root, shell=True, stdout=subprocess.PIPE)
print(ember_build.stdout.read())

# restore the settings file
print("restoring static file")
shutil.copy(os.path.join(temp_root, "settings.py"), os.path.join(mount_root, "archive"))

