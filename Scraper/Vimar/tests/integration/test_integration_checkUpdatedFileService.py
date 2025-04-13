import unittest
from Vimar.services.CheckUpdatedFileService import CheckUpdatedFileService
from Vimar.models.dbCheckOperationResponse import DbCheckOperationResponse
from Vimar.models.file import FilePdf
from Vimar.ports.checkUpdatedFilePort import CheckUpdatedFilePort

class MockCheckUpdatedFilePort(CheckUpdatedFilePort):
    def check_updated_file(self, file: FilePdf):
        # Simulate behavior for testing
        if file.get_url() == 'http://example.com/file.pdf':
            return DbCheckOperationResponse(success=True, message="File is updated")
        else:
            raise Exception("File not found")

class TestCheckUpdatedFileServiceIntegration(unittest.TestCase):
    def setUp(self):
        # Use the mock implementation of CheckUpdatedFilePort
        self.check_updated_file_port = MockCheckUpdatedFilePort()
        self.service = CheckUpdatedFileService(self.check_updated_file_port)

    def test_check_updated_file_success(self):
        # Create a real FilePdf object
        test_file = FilePdf(path="/path/to/file.pdf", url="http://example.com/file.pdf", objID=1)

        # Call the service method
        response = self.service.check_updated_file(test_file)

        # Assertions
        self.assertIsInstance(response, DbCheckOperationResponse)
        self.assertTrue(response.get_success())
        self.assertEqual(response.get_message(), "File is updated")

    def test_check_updated_file_failure(self):
        # Create a FilePdf object that will cause a failure
        test_file = FilePdf(path="/path/to/nonexistent.pdf", url="http://example.com/nonexistent.pdf", objID=999)

        # Call the service method and expect an exception
        with self.assertRaises(Exception) as context:
            self.service.check_updated_file(test_file)
        self.assertIn("File not found", str(context.exception))

if __name__ == '__main__':
    unittest.main()