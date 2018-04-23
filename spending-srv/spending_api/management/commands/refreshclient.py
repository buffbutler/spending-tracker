import subprocess
import os
import shutil

from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = 'Builds and copies the files from the client and moves them into the static directory for test runs'

    def handle(self, *args, **options):
        # this is part of the deployment process
        # there were a few options for deployment:
        # 1. run both ember and python on different ports proxied by nginx - this is more unstable and has
        #    more failure points
        # 2. run python server with ember client built - this is what was chosen.  The ember config is located
        #    in the spending_api-srv\settings.py file.  This should not be overwritten during a deployment.

        ember_root = os.path.realpath(os.path.join(os.getcwd(), '..\\spending-cli\\'))

        # build the client package
        ember_build = subprocess.Popen("ember build", cwd=ember_root, shell=True, stdout=subprocess.PIPE)
        print(ember_build.stdout.read())

        assets_root = os.path.realpath(os.path.join(ember_root, "dist\\assets\\"))
        static_root = os.path.realpath(os.path.join(os.getcwd(), "spending_api\\static"))

        # wipe out the static root
        for target_file_name in os.listdir(static_root):
            full_target_file_name = os.path.join(static_root, target_file_name)

            if os.path.isfile(full_target_file_name):
                print("deleting: {0}".format(full_target_file_name))
                os.remove(full_target_file_name)

        # copy the scripts to our static folder
        for source_file_name in os.listdir(assets_root):
            full_source_file_name = os.path.join(assets_root, source_file_name)

            if os.path.isfile(full_source_file_name):
                print("copying: {0}".format(source_file_name))
                shutil.copy(full_source_file_name, static_root)

