import unittest
from unittest.mock import MagicMock
from Vimar.services.insertProductService import InsertProductService
from Vimar.models.dbInsertOperationResponse import DbInsertOperationResponse
from Vimar.models.product import Product
from Vimar.ports.insertProductPort import InsertProductPort

class TestInsertProductService(unittest.TestCase):
    def setUp(self):
        # Mock the InsertProductPort
        self.mock_port = MagicMock(spec=InsertProductPort)
        self.service = InsertProductService(self.mock_port)

    def test_insert_product_success(self):
        # Mock the response from the port
        mock_response = DbInsertOperationResponse(success=True, message="Product inserted successfully")
        self.mock_port.insert_product.return_value = mock_response

        # Create a mock Product object
        mock_product = MagicMock(spec=Product)

        # Call the method
        response = self.service.insert_product(mock_product)

        # Assertions
        self.assertTrue(response.get_success())
        self.assertEqual(response.get_message(), "Product inserted successfully")
        self.mock_port.insert_product.assert_called_once_with(mock_product)

    def test_insert_product_failure(self):
        # Mock the port to raise an exception
        self.mock_port.insert_product.side_effect = Exception("Database error")

        # Create a mock Product object
        mock_product = MagicMock(spec=Product)

        # Call the method and assert it raises an exception
        with self.assertRaises(Exception) as context:
            self.service.insert_product(mock_product)
        self.assertEqual(str(context.exception), "Database error")
        self.mock_port.insert_product.assert_called_once_with(mock_product)

if __name__ == '__main__':
    unittest.main()