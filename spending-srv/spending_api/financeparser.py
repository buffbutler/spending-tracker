import csv
from ofxparse import OfxParser

"""
All the classes here are the parsers that are connected to the main views via "reflection"
They all implementa standard interface.
"""


class CsvFinancialStatementReader:
    """
    Simple csv based parser
    """

    def __init__(self, work_file):
        self.work_file = work_file
        self.field_pattern = self.auto_detect_columns()

    def accept(self):
        """
        Test the file if it can be handled
        :return: If a match then True
        """
        return self.work_file.original_name.endswith(".csv")

    def __str__(self):
        """
        For debugging and testing
        :return:
        """
        return "CSV"

    def auto_detect_columns(self):
        """
        (Not part of the interface)
        Based on the file contents return the csv layout.  Each array item
        will represent a field that the csv column will be assigned to.  An
        empty string or None means the column will be skipped.
        :return: An array representing the columns to be mapped from the CSV file
        """
        # todo
        return ["transaction_date", "name", "amount"]

    def read(self, fso):
        """
        Read the file contents into the standard dictionary object
        :param fso: A file system object that implements open
        :return:
        """

        # we accumulate the results here
        result = []

        with fso.open(self.work_file.get_file_name(), 'r') as csv_file:
            csv_reader = csv.reader(csv_file)

            for row in csv_reader:
                # the dictionary object we are populating
                record = {}

                for field_value, field_name in zip(row, self.field_pattern):
                    # if the field name is blank then we skip the column
                    if len(field_name) > 0:
                        record[field_name] = field_value

                # add to teh result set
                result.append(record)

        return result


class OfxFinancialStatementReader:
    """
    An OFX parser based on ofxparse library
    implementing our standard interface outlined by the CSV parser
    """

    def __init__(self, work_file):
        self.work_file = work_file

    def accept(self):
        return self.work_file.original_name.endswith(".ofx") or self.work_file.original_name.endswith(".qfx")

    def __str__(self):
        return "OFX"

    def read(self, fso):
        result = []

        with fso.open(self.work_file.get_file_name(), 'r') as ofx_file:
            ofx = OfxParser.parse(ofx_file)

            for current in ofx.account.statement.transactions:
                # the dictionary object we are populating
                record = {}

                record['transaction_date'] = current.date
                record['name'] = current.payee
                record['amount'] = str(abs(current.amount))

                # accumulate results
                result.append(record)

        return result

