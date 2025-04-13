import unittest
from Vimar.services.insertFileService import InsertFileService
from Vimar.models.dbInsertOperationResponse import DbInsertOperationResponse
from Vimar.models.file import FilePdf
from Vimar.ports.insertFilePort import InsertFilePort

class RealInsertFilePort(InsertFilePort):
    def insert_file(self, file: FilePdf):
        # Simulate a real implementation of the port
        # Replace this with actual logic for integration testing
        if file.get_url() == "http://example.com/file.pdf":
            return DbInsertOperationResponse(success=True, message="File inserted successfully")
        else:
            raise Exception("Failed to insert file")

class TestInsertFileServiceIntegration(unittest.TestCase):
    def setUp(self):
        # Use the real implementation of InsertFilePort
        self.real_port = RealInsertFilePort()
        self.service = InsertFileService(self.real_port)

    def test_insert_file_success(self):
        # Create a real FilePdf object
        file = FilePdf(path="/path/to/file.pdf", url="http://example.com/file.pdf", objID=1)

        # Call the service method
        response = self.service.insert_file(file)

        # Assertions
        self.assertIsInstance(response, DbInsertOperationResponse)
        self.assertTrue(response.get_success())
        self.assertEqual(response.get_message(), "File inserted successfully")

    def test_insert_file_failure(self):
        # Create a FilePdf object that will cause a failure
        file = FilePdf(path="/path/to/invalid.pdf", url="http://example.com/invalid.pdf", objID=999)

        # Call the service method and assert it raises an exception
        with self.assertRaises(Exception) as context:
            self.service.insert_file(file)
        self.assertEqual(str(context.exception), "Failed to insert file")

if __name__ == '__main__':
    unittest.main()