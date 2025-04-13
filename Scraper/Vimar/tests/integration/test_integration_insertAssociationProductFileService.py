import unittest
from Vimar.services.insertAssociationProductFileService import InsertAssociationProductFileService
from Vimar.models.dbInsertOperationResponse import DbInsertOperationResponse
from Vimar.models.file import FilePdf
from Vimar.models.product import Product
from Vimar.ports.insertAssociationProductFilePort import InsertAssociationProductFilePort

class RealInsertAssociationProductFilePort(InsertAssociationProductFilePort):
    def insert_association_product_file(self, product: Product, file: FilePdf):
        # Simulate a real implementation of the port
        # Replace this with actual logic for integration testing
        if product.get_id() == 1 and file.get_url() == 'http://example.com/file.pdf':
            return DbInsertOperationResponse(success=True, message="Association inserted successfully")
        else:
            raise Exception("Failed to insert association")

class TestInsertAssociationProductFileServiceIntegration(unittest.TestCase):
    def setUp(self):
        # Use the real implementation of InsertAssociationProductFilePort
        self.real_port = RealInsertAssociationProductFilePort()
        self.service = InsertAssociationProductFileService(self.real_port)

    def test_insert_association_product_file_success(self):
        # Create real Product and FilePdf objects
        product = Product(id=1, name="Test Product", description="Test Description", etim='{"etim": "test"}')
        file = FilePdf(path='/path/to/file.pdf', url='http://example.com/file.pdf', objID='1')

        # Call the service method
        response = self.service.insert_association_product_file(product, file)

        # Assertions
        self.assertIsInstance(response, DbInsertOperationResponse)
        self.assertTrue(response.get_success())
        self.assertEqual(response.get_message(), "Association inserted successfully")

    def test_insert_association_product_file_failure(self):
        # Create Product and FilePdf objects that will cause a failure
        product = Product(id=1, name="Test Product", description="Test Description", etim='{"etim": "test"}')
        file = FilePdf(path='', url='http://example.com/nonexistentfile.pdf', objID='1')

        # Call the service method and assert it raises an exception
        with self.assertRaises(Exception) as context:
            self.service.insert_association_product_file(product, file)
        self.assertEqual(str(context.exception), "Failed to insert association")

if __name__ == '__main__':
    unittest.main()