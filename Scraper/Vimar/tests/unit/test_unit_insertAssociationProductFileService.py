import unittest
from unittest.mock import MagicMock
from Vimar.services.insertAssociationProductFileService import InsertAssociationProductFileService
from Vimar.models.dbInsertOperationResponse import DbInsertOperationResponse
from Vimar.models.file import FilePdf
from Vimar.models.product import Product
from Vimar.ports.insertAssociationProductFilePort import InsertAssociationProductFilePort

class TestInsertAssociationProductFileService(unittest.TestCase):
    def setUp(self):
        # Mock the InsertAssociationProductFilePort
        self.mock_port = MagicMock(spec=InsertAssociationProductFilePort)
        self.service = InsertAssociationProductFileService(self.mock_port)

    def test_insert_association_product_file_success(self):
        # Mock the response from the port
        mock_response = DbInsertOperationResponse(success=True, message="Association inserted successfully")
        self.mock_port.insert_association_product_file.return_value = mock_response

        # Create mock Product and FilePdf objects
        mock_product = MagicMock(spec=Product)
        mock_file = MagicMock(spec=FilePdf)

        # Call the method
        response = self.service.insert_association_product_file(mock_product, mock_file)

        # Assertions
        self.assertTrue(response.get_success())
        self.assertEqual(response.get_message(), "Association inserted successfully")
        self.mock_port.insert_association_product_file.assert_called_once_with(mock_product, mock_file)

    def test_insert_association_product_file_failure(self):
        # Mock the port to raise an exception
        self.mock_port.insert_association_product_file.side_effect = Exception("Database error")

        # Create mock Product and FilePdf objects
        mock_product = MagicMock(spec=Product)
        mock_file = MagicMock(spec=FilePdf)

        # Call the method and assert it raises an exception
        with self.assertRaises(Exception) as context:
            self.service.insert_association_product_file(mock_product, mock_file)
        self.assertEqual(str(context.exception), "Database error")
        self.mock_port.insert_association_product_file.assert_called_once_with(mock_product, mock_file)

if __name__ == '__main__':
    unittest.main()