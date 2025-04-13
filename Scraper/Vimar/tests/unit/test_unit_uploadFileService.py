import unittest
from unittest.mock import MagicMock
from Vimar.services.uploadFileService import UploadFileService
from Vimar.models.dbUploadOperationResponse import DbUploadOperationResponse
from Vimar.models.file import FilePdf
from Vimar.ports.uploadFilePort import UploadFilePort

class TestUploadFileService(unittest.TestCase):
    def setUp(self):
        # Mock the UploadFilePort
        self.mock_port = MagicMock(spec=UploadFilePort)
        self.service = UploadFileService(self.mock_port)

    def test_upload_file_success(self):
        # Mock the response from the port
        mock_response = DbUploadOperationResponse(success=True, objID='1', message="File uploaded successfully")
        self.mock_port.upload_file.return_value = mock_response

        # Create a mock FilePdf object
        mock_file = MagicMock(spec=FilePdf)

        # Call the method
        response = self.service.upload_file(mock_file)

        # Assertions
        self.assertTrue(response.get_success())
        self.assertEqual(response.get_objID(), '1')
        self.assertEqual(response.get_message(), "File uploaded successfully")
        self.mock_port.upload_file.assert_called_once_with(mock_file)

    def test_upload_file_failure(self):
        # Mock the port to raise an exception
        self.mock_port.upload_file.side_effect = Exception("Database error")

        # Create a mock FilePdf object
        mock_file = MagicMock(spec=FilePdf)

        # Call the method and assert it raises an exception
        with self.assertRaises(Exception) as context:
            self.service.upload_file(mock_file)
        self.assertEqual(str(context.exception), "Database error")
        self.mock_port.upload_file.assert_called_once_with(mock_file)

if __name__ == '__main__':
    unittest.main()