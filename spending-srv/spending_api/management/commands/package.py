import subprocess
import os
import shutil
import zipfile

from .refreshclient import Command as RefreshClientCommand

from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = 'Generates a package for deployment'

    def handle(self, *args, **options):
        # sub dependant command... there's likely a better way
        RefreshClientCommand.handle(self, args, options)

        # copy the django archive to our publishing folder
        pub_root = os.path.realpath(os.path.join(os.getcwd(), '..\\pub\\'))

        print("cleaning publishing directory {0}".format(pub_root))

        if os.path.exists(pub_root):
            shutil.rmtree(pub_root)

        if not os.path.exists(pub_root):
            os.makedirs(pub_root)

        print("start: archive copy")

        zip_package = "{0}\\spending_api-package.zip".format(pub_root)
        git_archive_cmd = "git archive master --format zip --output {0}".format(zip_package)

        git_archive = subprocess.Popen(git_archive_cmd, shell=True, stdout=subprocess.PIPE)
        git_archive.wait(10000)

        print("finished: archive copy")

        print("start: merging client files")
        static_root = os.path.realpath(os.path.join(os.getcwd(), "spending_api\\static"))

        with zipfile.ZipFile(zip_package, "a", compression=zipfile.ZIP_DEFLATED) as zip_archive:
            for source_file_name in os.listdir(static_root):
                full_source_file_name = os.path.join(static_root, source_file_name)

                if os.path.isfile(full_source_file_name):
                    zip_archive.write(full_source_file_name, "spending_api\\static\\{0}".format(source_file_name))

        print("finished: merging client files")

