import os
import datetime

from django.urls import reverse
from django.test import TestCase


from .financeparser import CsvFinancialStatementReader, OfxFinancialStatementReader
from .models import Workspace, Journal, WorkFile


class FileOpenMock:
    """
    Simulated version of the django file system object that points to the test directory
    """
    def open(self, filename, mode):
        path = os.path.join(os.path.dirname(os.path.realpath(__file__)), "testdata\\" + filename)

        return open(path, mode)


class FileImportTests(TestCase):

    def test_can_load_csv_file(self):
        # configure
        fso = FileOpenMock()
        work_file = WorkFile(original_name="cibc.csv", id=1, public_key="cibccsv")
        reader = CsvFinancialStatementReader(work_file)

        # run
        result = reader.read(fso)

        # assert
        self.assertEquals(len(result), 17, "should have parsed 17 records")

    def test_can_load_qfx_file(self):
        # configure
        fso = FileOpenMock()
        work_file = WorkFile(original_name="cibc.qfx", id=1, public_key="cibcqfx")
        reader = OfxFinancialStatementReader(work_file)

        # run
        result = reader.read(fso)

        # assert
        self.assertEquals(len(result), 26, "should have parsed 26 records")

    def test_model_initalize_workspace_with_initial_file(self):
        # configure
        my_workspace = Workspace()
        my_workspace.save()

        # run
        workspace_file = my_workspace.intake_file("sample.csv")

        # assert
        self.assertEquals(workspace_file.original_name, "sample.csv")

    def test_model_classify_csv_workfile(self):
        work_file = WorkFile(original_name="cibc.csv", id=1, public_key="cibccsv")

        reader = work_file.classify_workfile()

        self.assertEquals(str(reader), "CSV", "The reader should be a csv reader")

    def test_model_parse_to_journal(self):
        # configure
        my_workspace = Workspace()
        my_workspace.save()
        fso = FileOpenMock()
        # we aren't going to save this because the id wouldn't match the test file
        work_file = WorkFile(original_name="cibc.csv", id=1, public_key="cibccsv", workspace_id=my_workspace.id)

        # run
        work_file.parse_to_journal(fso)

        # assert
        result_count = Journal.objects.filter(workspace_id=my_workspace.id).count()
        self.assertEquals(result_count, 17, "should have parsed 17 records")


class FileImportTests(TestCase):
    def test_view_workspace_isolation(self):
        # configure
        my_workspace = Workspace()
        my_workspace.save()

        # create 2 journal records
        my_workspace.journal_set.create(amount=1,name="a",transaction_date=datetime.datetime.now()).save()
        my_workspace.journal_set.create(amount=3,name="b",transaction_date=datetime.datetime.now()).save()

        other_workspace = Workspace()
        other_workspace.save()

        # create 1 journal record
        my_workspace.journal_set.create(amount=7,name="c",transaction_date=datetime.datetime.now()).save()

        # test
        url = reverse('spending_api:rest_workspace', args=(my_workspace.public_key,))
        response = self.client.get(url)

        first_name = response.data['journal'][0]['Journal']['name']

        self.assertEquals(first_name, "a")







