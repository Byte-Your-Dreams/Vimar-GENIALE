import unittest
from Vimar.services.uploadFileService import UploadFileService
from Vimar.models.dbUploadOperationResponse import DbUploadOperationResponse
from Vimar.models.file import FilePdf
from Vimar.ports.uploadFilePort import UploadFilePort

class RealUploadFilePort(UploadFilePort):
    def upload_file(self, file: FilePdf):
        # Simulate a real implementation of the port
        # Replace this with actual logic for integration testing
        if file.get_url() == "http://example.com/file.pdf":
            return DbUploadOperationResponse(success=True, objID='1', message="File uploaded successfully")
        else:
            raise Exception("Failed to upload file")

class TestUploadFileServiceIntegration(unittest.TestCase):
    def setUp(self):
        # Use the real implementation of UploadFilePort
        self.real_port = RealUploadFilePort()
        self.service = UploadFileService(self.real_port)

    def test_upload_file_success(self):
        # Create a real FilePdf object
        file = FilePdf(path="/path/to/file.pdf", url="http://example.com/file.pdf", objID='1')

        # Call the service method
        response = self.service.upload_file(file)

        # Assertions
        self.assertIsInstance(response, DbUploadOperationResponse)
        self.assertTrue(response.get_success())
        self.assertEqual(response.get_objID(), '1')
        self.assertEqual(response.get_message(), "File uploaded successfully")

    def test_upload_file_failure(self):
        # Create a FilePdf object that will cause a failure
        file = FilePdf(path="/path/to/invalid.pdf", url="http://example.com/invalid.pdf", objID='999')

        # Call the service method and assert it raises an exception
        with self.assertRaises(Exception) as context:
            self.service.upload_file(file)
        self.assertEqual(str(context.exception), "Failed to upload file")

if __name__ == '__main__':
    unittest.main()