import os
import shutil
import zipfile
import sys

# deployment constraints
# we don't touch the user files or the database
# we don't touch the settings.py

# SETTINGS

# simple script to copy out the files to the server mount point
mount_root = "/var/spending_api/app/"
temp_root = "/var/spending_api/archive/"
archive_source = os.path.realpath(sys.argv[0])

# WORKFLOW

print("mount: {0}".format(mount_root))
print("temp: {0}".format(temp_root))
print("source: {0}".format(archive_source))

if len(sys.argv) <= 1:
    print("A source file is not specified")
    exit()

# backup the settings file
settings_file = os.path.join(mount_root, 'spending_api-srv/settings.py')
shutil.copy(settings_file, temp_root)

# wipe out the mount tree
for source_file_name in os.listdir(mount_root):
    full_source_file_name = os.path.join(mount_root, source_file_name)

    if os.path.isfile(full_source_file_name):
        os.remove(full_source_file_name)
    else:
        shutil.rmtree(full_source_file_name)

# extract the archive
with zipfile.ZipFile(archive_source) as zip_archive:
    zip_archive.extractall(mount_root)

# restore the settings file
shutil.copy(os.path.join(temp_root, "settings.py"), os.path.join(mount_root, "archive"))

