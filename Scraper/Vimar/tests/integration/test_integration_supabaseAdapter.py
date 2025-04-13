import unittest
from unittest.mock import MagicMock, ANY
from Vimar.adapters.supabaseAdapter import SupabaseAdapter
from Vimar.repositories.supabaseRepository import SupabaseRepository
from Vimar.models.product import Product
from Vimar.models.file import FilePdf
from Vimar.models.faq import Faq
from Vimar.models.dbInsertOperationResponse import DbInsertOperationResponse
from Vimar.models.dbCheckOperationResponse import DbCheckOperationResponse
from Vimar.models.dbUploadOperationResponse import DbUploadOperationResponse
from Vimar.entities.supabaseInsertOperationResponse import SupabaseInsertOperationResponse
from Vimar.entities.supabaseCheckOperationResponse import SupabaseCheckOperationResponse
from Vimar.entities.supabaseUploadOperationResponse import SupabaseUploadOperationResponse

class TestSupabaseAdapterIntegration(unittest.TestCase):
    def setUp(self):
        # Mock the repository
        self.repository_mock = MagicMock(spec=SupabaseRepository)
        self.adapter = SupabaseAdapter(self.repository_mock)

    def test_insert_product(self):
        # Mock the repository response
        self.repository_mock.insert_product.return_value = SupabaseInsertOperationResponse(True, "Product inserted successfully")

        # Create a product
        product = Product(id="123", name="Test Product", description="Test Description", etim='{"key": "value"}')

        # Call the method
        response = self.adapter.insert_product(product)

        # Assertions
        self.assertTrue(response.get_success())
        self.assertEqual(response.get_message(), "Product inserted successfully")
        self.repository_mock.insert_product.assert_called_once()

    def test_insert_product_argument_verification(self):
        # Mock the repository response
        self.repository_mock.insert_product.return_value = SupabaseInsertOperationResponse(True, "Product inserted successfully")

        # Create a product
        product = Product(id="123", name="Test Product", description="Test Description", etim='{"key": "value"}')

        # Call the method
        self.adapter.insert_product(product)

        # Verify the correct arguments were passed to the repository
        self.repository_mock.insert_product.assert_called_once()
        called_arg = self.repository_mock.insert_product.call_args[0][0]
        self.assertEqual(called_arg.id, "123")
        self.assertEqual(called_arg.nome, "Test Product")
        self.assertEqual(called_arg.descrizione, "Test Description")

    def test_insert_product_with_invalid_product(self):
        # Pass None as the product
        with self.assertRaises(ValueError):
            self.adapter.insert_product(None)

    def test_insert_product_with_empty_etim(self):
        # Mock the repository response
        self.repository_mock.insert_product.return_value = SupabaseInsertOperationResponse(True, "Product inserted successfully")

        # Create a product with an empty etim
        product = Product(id="123", name="Test Product", description="Test Description", etim="")

        # Call the method
        response = self.adapter.insert_product(product)

        # Assertions
        self.assertTrue(response.get_success())
        self.assertEqual(response.get_message(), "Product inserted successfully")

    def test_check_updated_file(self):
        # Mock the repository response
        self.repository_mock.check_updated_file.return_value = SupabaseCheckOperationResponse(True, True)

        # Create a file
        file = FilePdf(path="path/to/test.pdf", url=None, objID=None)

        # Call the method
        response = self.adapter.check_updated_file(file)

        # Assertions
        self.assertTrue(response.get_success())
        self.assertTrue(response.get_message())
        self.repository_mock.check_updated_file.assert_called_once()

    def test_upload_file(self):
        # Mock the repository response
        self.repository_mock.upload_file.return_value = SupabaseUploadOperationResponse(True, "file_id", "File uploaded successfully")

        # Create a file
        file = FilePdf(path="path/to/test.pdf", url=None, objID=None)

        # Call the method
        response = self.adapter.upload_file(file)

        # Assertions
        self.assertTrue(response.get_success())
        self.assertEqual(response.get_objID(), "file_id")
        self.assertEqual(response.get_message(), "File uploaded successfully")
        self.repository_mock.upload_file.assert_called_once()

    def test_insert_file(self):
        # Mock the repository response
        self.repository_mock.insert_file.return_value = SupabaseInsertOperationResponse(True, "File inserted successfully")

        # Create a file
        file = FilePdf(path="path/to/test.pdf", url="https://example.com/test.pdf", objID="file_id")

        # Call the method
        response = self.adapter.insert_file(file)

        # Assertions
        self.assertTrue(response.get_success())
        self.assertEqual(response.get_message(), "File inserted successfully")
        self.repository_mock.insert_file.assert_called_once()

    def test_insert_association_product_file(self):
        # Mock the repository response
        self.repository_mock.insert_association_product_file.return_value = SupabaseInsertOperationResponse(True, "Association inserted successfully")

        # Create a product and file
        product = Product(id="123", name="Test Product", description="Test Description", etim='{"key": "value"}')
        file = FilePdf(path="path/to/test.pdf", url="https://example.com/test.pdf", objID="file_id")

        # Call the method
        response = self.adapter.insert_association_product_file(product, file)

        # Assertions
        self.assertTrue(response.get_success())
        self.assertEqual(response.get_message(), "Association inserted successfully")
        self.repository_mock.insert_association_product_file.assert_called_once()

    def test_insert_faq(self):
        # Mock the repository response
        self.repository_mock.insert_faq.return_value = SupabaseInsertOperationResponse(True, "FAQ inserted successfully")

        # Create a FAQ
        faq = Faq(productID="123", question="What is this?", answer="This is a test FAQ.")

        # Call the method
        response = self.adapter.insert_faq(faq)

        # Assertions
        self.assertTrue(response.get_success())
        self.assertEqual(response.get_message(), "FAQ inserted successfully")
        self.repository_mock.insert_faq.assert_called_once()

    def test_end_update(self):
        # Mock the repository response
        self.repository_mock.end_update.return_value = SupabaseInsertOperationResponse(True, "Update completed successfully")

        # Call the method
        response = self.adapter.end_update()

        # Assertions
        self.assertTrue(response.get_success())
        self.assertEqual(response.get_message(), "Update completed successfully")
        self.repository_mock.end_update.assert_called_once()

if __name__ == "__main__":
    unittest.main()