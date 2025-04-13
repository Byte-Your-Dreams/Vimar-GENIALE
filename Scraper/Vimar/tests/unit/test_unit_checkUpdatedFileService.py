import unittest
from unittest.mock import MagicMock
from Vimar.services.CheckUpdatedFileService import CheckUpdatedFileService
from Vimar.models.dbCheckOperationResponse import DbCheckOperationResponse
from Vimar.models.file import FilePdf
from Vimar.ports.checkUpdatedFilePort import CheckUpdatedFilePort

class TestCheckUpdatedFileService(unittest.TestCase):
    def setUp(self):
        # Mock the CheckUpdatedFilePort
        self.mock_port = MagicMock(spec=CheckUpdatedFilePort)
        self.service = CheckUpdatedFileService(self.mock_port)

    def test_check_updated_file_success(self):
        # Mock the response from the port
        mock_response = DbCheckOperationResponse(success=True, message="File is updated")
        self.mock_port.check_updated_file.return_value = mock_response

        # Create a mock file
        mock_file = MagicMock(spec=FilePdf)

        # Call the method
        response = self.service.check_updated_file(mock_file)

        # Assertions
        self.assertTrue(response.get_success())
        self.assertEqual(response.get_message(), "File is updated")
        self.mock_port.check_updated_file.assert_called_once_with(mock_file)

    def test_check_updated_file_exception(self):
        # Mock the port to raise an exception
        self.mock_port.check_updated_file.side_effect = Exception("Database error")

        # Create a mock file
        mock_file = MagicMock(spec=FilePdf)

        # Call the method and assert it raises an exception
        with self.assertRaises(Exception) as context:
            self.service.check_updated_file(mock_file)
        self.assertEqual(str(context.exception), "Database error")
        self.mock_port.check_updated_file.assert_called_once_with(mock_file)

if __name__ == '__main__':
    unittest.main()