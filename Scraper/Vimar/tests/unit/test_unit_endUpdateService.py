import unittest
from unittest.mock import MagicMock
from Vimar.services.endUpdateService import EndUpdateService
from Vimar.models.dbInsertOperationResponse import DbInsertOperationResponse
from Vimar.ports.endUpdatePort import EndUpdatePort

class TestEndUpdateService(unittest.TestCase):
    def setUp(self):
        # Mock the EndUpdatePort
        self.mock_port = MagicMock(spec=EndUpdatePort)
        self.service = EndUpdateService(self.mock_port)

    def test_end_update_success(self):
        # Mock the response from the port
        mock_response = DbInsertOperationResponse(success=True, message="Update ended successfully")
        self.mock_port.end_update.return_value = mock_response

        # Call the method
        response = self.service.end_update()

        # Assertions
        self.assertTrue(response.get_success())
        self.assertEqual(response.get_message(), "Update ended successfully")
        self.mock_port.end_update.assert_called_once()

    def test_end_update_failure(self):
        # Mock the port to raise an exception
        self.mock_port.end_update.side_effect = Exception("Database error")

        # Call the method and assert it raises an exception
        with self.assertRaises(Exception) as context:
            self.service.end_update()
        self.assertEqual(str(context.exception), "Database error")
        self.mock_port.end_update.assert_called_once()

if __name__ == '__main__':
    unittest.main()