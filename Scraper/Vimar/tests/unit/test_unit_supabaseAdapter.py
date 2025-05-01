import unittest
from unittest.mock import MagicMock
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

class TestSupabaseAdapter(unittest.TestCase):
    def setUp(self):
        # Mock the repository
        self.repository_mock = MagicMock(spec=SupabaseRepository)
        self.adapter = SupabaseAdapter(self.repository_mock)

    def test_insert_product_success(self):
        # Mock the repository response
        self.repository_mock.insert_product.return_value = SupabaseInsertOperationResponse(True, "Product inserted successfully")

        # Create a mock product
        product = MagicMock(spec=Product)
        product.get_id.return_value = "123"
        product.get_name.return_value = "Test Product"
        product.get_description.return_value = "Test Description"
        product.get_etim.return_value = '{"key": "value"}'

        # Call the method
        response = self.adapter.insert_product(product)

        # Assertions
        self.assertTrue(response.get_success())
        self.assertEqual(response.get_message(), "Product inserted successfully")
        self.repository_mock.insert_product.assert_called_once()

    def test_check_updated_file_success(self):
        # Mock the repository response
        self.repository_mock.check_updated_file.return_value = SupabaseCheckOperationResponse(True, True)

        # Create a mock file
        file = MagicMock(spec=FilePdf)
        file.get_name.return_value = "test.pdf"

        # Call the method
        response = self.adapter.check_updated_file(file)

        # Assertions
        self.assertTrue(response.get_success())
        self.assertTrue(response.get_message())
        self.repository_mock.check_updated_file.assert_called_once()

    def test_upload_file_success(self):
        # Mock the repository response
        self.repository_mock.upload_file.return_value = SupabaseUploadOperationResponse(True, "file_id", "File uploaded successfully")

        # Create a mock file
        file = MagicMock(spec=FilePdf)
        file.get_path.return_value = "path/to/test.pdf"
        file.get_name.return_value = "test.pdf"

        # Call the method
        response = self.adapter.upload_file(file)

        # Assertions
        self.assertTrue(response.get_success())
        self.assertEqual(response.get_objID(), "file_id")
        self.assertEqual(response.get_message(), "File uploaded successfully")
        self.repository_mock.upload_file.assert_called_once()

    def test_insert_file_success(self):
        # Mock the repository response
        self.repository_mock.insert_file.return_value = SupabaseInsertOperationResponse(True, "PDF inserted successfully")

        # Create a mock file
        file = MagicMock(spec=FilePdf)
        file.get_url.return_value = "https://example.com/test.pdf"
        file.get_name.return_value = "test.pdf"
        file.get_objID.return_value = "file_id"

        # Call the method
        response = self.adapter.insert_file(file)

        # Assertions
        self.assertTrue(response.get_success())
        self.assertEqual(response.get_message(), "PDF inserted successfully")
        self.repository_mock.insert_file.assert_called_once()

    def test_insert_association_product_file_success(self):
        # Mock the repository response
        self.repository_mock.insert_association_product_file.return_value = SupabaseInsertOperationResponse(True, "Association inserted successfully")

        # Create mock product and file
        product = MagicMock(spec=Product)
        product.get_id.return_value = "123"
        product.get_etim.return_value = '{"key": "value"}'  # Mock valid JSON string

        file = MagicMock(spec=FilePdf)
        file.get_url.return_value = "https://example.com/test.pdf"

        # Call the method
        response = self.adapter.insert_association_product_file(product, file)

        # Assertions
        self.assertTrue(response.get_success())
        self.assertEqual(response.get_message(), "Association inserted successfully")
        self.repository_mock.insert_association_product_file.assert_called_once()

    def test_insert_faq_success(self):
        # Mock the repository response
        self.repository_mock.insert_faq.return_value = SupabaseInsertOperationResponse(True, "FAQ inserted successfully")

        # Create a mock FAQ
        faq = MagicMock(spec=Faq)
        faq.get_productID.return_value = "123"
        faq.get_question.return_value = "What is this?"
        faq.get_answer.return_value = "This is a test."

        # Call the method
        response = self.adapter.insert_faq(faq)

        # Assertions
        self.assertTrue(response.get_success())
        self.assertEqual(response.get_message(), "FAQ inserted successfully")
        self.repository_mock.insert_faq.assert_called_once()

    def test_end_update_success(self):
        # Mock the repository response
        self.repository_mock.end_update.return_value = SupabaseInsertOperationResponse(True, "Update completed successfully")

        # Call the method
        response = self.adapter.end_update()

        # Assertions
        self.assertTrue(response.get_success())
        self.assertEqual(response.get_message(), "Update completed successfully")
        self.repository_mock.end_update.assert_called_once()
    
    def test_supabase_product_converter_none(self):
        with self.assertRaises(ValueError):
            self.adapter._SupabaseAdapter__supabase_product_converter(None)

    def test_supabase_product_converter_invalid_etim(self):
        product = MagicMock(spec=Product)
        product.get_etim.return_value = "{invalid_json}"
        
        supabase_product = self.adapter._SupabaseAdapter__supabase_product_converter(product)
        
        self.assertEqual(supabase_product.etim, "{}")

    def test_supabase_file_converter_none(self):
        with self.assertRaises(ValueError):
            self.adapter._SupabaseAdapter__supabase_file_converter(None)

    def test_supabase_faq_converter_none(self):
        with self.assertRaises(ValueError):
            self.adapter._SupabaseAdapter__supabase_faq_converter(None)

    def test_check_updated_file_repository_exception(self):
        self.repository_mock.check_updated_file.side_effect = Exception("Check error")
        file = MagicMock(spec=FilePdf)
        
        with self.assertRaises(Exception) as context:
            self.adapter.check_updated_file(file)
        self.assertIn("Check error", str(context.exception))

if __name__ == "__main__":
    unittest.main()