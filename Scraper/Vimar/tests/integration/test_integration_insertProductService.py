import unittest
from Vimar.services.insertProductService import InsertProductService
from Vimar.models.dbInsertOperationResponse import DbInsertOperationResponse
from Vimar.models.product import Product
from Vimar.ports.insertProductPort import InsertProductPort

class RealInsertProductPort(InsertProductPort):
    def insert_product(self, product: Product):
        # Simulate a real implementation of the port
        # Replace this with actual logic for integration testing
        if product.get_id() == 1 and product.get_name() == "Test Product":
            return DbInsertOperationResponse(success=True, message="Product inserted successfully")
        else:
            raise Exception("Failed to insert product")

class TestInsertProductServiceIntegration(unittest.TestCase):
    def setUp(self):
        # Use the real implementation of InsertProductPort
        self.real_port = RealInsertProductPort()
        self.service = InsertProductService(self.real_port)

    def test_insert_product_success(self):
        # Create a real Product object
        product = Product(id=1, name="Test Product", description="Test Description", etim='{"etim": "test"}')

        # Call the service method
        response = self.service.insert_product(product)

        # Assertions
        self.assertIsInstance(response, DbInsertOperationResponse)
        self.assertTrue(response.get_success())
        self.assertEqual(response.get_message(), "Product inserted successfully")

    def test_insert_product_failure(self):
        # Create a Product object that will cause a failure
        product = Product(id=999, name="Invalid Product", description="Invalid Description", etim='{"etim": "invalid"}')

        # Call the service method and assert it raises an exception
        with self.assertRaises(Exception) as context:
            self.service.insert_product(product)
        self.assertEqual(str(context.exception), "Failed to insert product")

if __name__ == '__main__':
    unittest.main()