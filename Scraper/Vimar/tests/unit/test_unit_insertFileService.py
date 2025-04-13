import unittest
from unittest.mock import MagicMock
from Vimar.services.insertFileService import InsertFileService
from Vimar.models.dbInsertOperationResponse import DbInsertOperationResponse
from Vimar.models.file import FilePdf
from Vimar.ports.insertFilePort import InsertFilePort

class TestInsertFileService(unittest.TestCase):
    def setUp(self):
        # Mock the InsertFilePort
        self.mock_port = MagicMock(spec=InsertFilePort)
        self.service = InsertFileService(self.mock_port)

    def test_insert_file_success(self):
        # Mock the response from the port
        mock_response = DbInsertOperationResponse(success=True, message="File inserted successfully")
        self.mock_port.insert_file.return_value = mock_response

        # Create a mock FilePdf object
        mock_file = MagicMock(spec=FilePdf)

        # Call the method
        response = self.service.insert_file(mock_file)

        # Assertions
        self.assertTrue(response.get_success())
        self.assertEqual(response.get_message(), "File inserted successfully")
        self.mock_port.insert_file.assert_called_once_with(mock_file)

    def test_insert_file_failure(self):
        # Mock the port to raise an exception
        self.mock_port.insert_file.side_effect = Exception("Database error")

        # Create a mock FilePdf object
        mock_file = MagicMock(spec=FilePdf)

        # Call the method and assert it raises an exception
        with self.assertRaises(Exception) as context:
            self.service.insert_file(mock_file)
        self.assertEqual(str(context.exception), "Database error")
        self.mock_port.insert_file.assert_called_once_with(mock_file)

if __name__ == '__main__':
    unittest.main()