import unittest
from unittest.mock import MagicMock
from Vimar.services.insertFaqService import InsertFaqService
from Vimar.models.dbInsertOperationResponse import DbInsertOperationResponse
from Vimar.models.faq import Faq
from Vimar.ports.insertFaqPort import InsertFaqPort

class TestInsertFaqService(unittest.TestCase):
    def setUp(self):
        # Mock the InsertFaqPort
        self.mock_port = MagicMock(spec=InsertFaqPort)
        self.service = InsertFaqService(self.mock_port)

    def test_insert_faq_success(self):
        # Mock the response from the port
        mock_response = DbInsertOperationResponse(success=True, message="FAQ inserted successfully")
        self.mock_port.insert_faq.return_value = mock_response

        # Create a mock Faq object
        mock_faq = MagicMock(spec=Faq)

        # Call the method
        response = self.service.insert_faq(mock_faq)

        # Assertions
        self.assertTrue(response.get_success())
        self.assertEqual(response.get_message(), "FAQ inserted successfully")
        self.mock_port.insert_faq.assert_called_once_with(mock_faq)

    def test_insert_faq_failure(self):
        # Mock the port to raise an exception
        self.mock_port.insert_faq.side_effect = Exception("Database error")

        # Create a mock Faq object
        mock_faq = MagicMock(spec=Faq)

        # Call the method and assert it raises an exception
        with self.assertRaises(Exception) as context:
            self.service.insert_faq(mock_faq)
        self.assertEqual(str(context.exception), "Database error")
        self.mock_port.insert_faq.assert_called_once_with(mock_faq)

if __name__ == '__main__':
    unittest.main()