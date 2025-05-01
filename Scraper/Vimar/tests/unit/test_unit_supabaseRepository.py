import unittest, logging
from unittest.mock import MagicMock, patch, call
from Vimar.repositories.supabaseRepository import SupabaseRepository
from Vimar.entities.supabaseProduct import SupabaseProduct
from Vimar.entities.supabaseFile import SupabaseFile
from Vimar.entities.supabaseFaq import SupabaseFaq
from Vimar.entities.supabaseInsertOperationResponse import SupabaseInsertOperationResponse
from Vimar.entities.supabaseCheckOperationResponse import SupabaseCheckOperationResponse
from Vimar.entities.supabaseUploadOperationResponse import SupabaseUploadOperationResponse

logging.basicConfig(level=logging.INFO)
class TestSupabaseRepository(unittest.TestCase):
    def setUp(self):
        # Patch the Supabase client
        self.supabase_mock = patch('Vimar.repositories.supabaseRepository.create_client').start()
        self.supabase_client_mock = MagicMock()
        self.supabase_mock.return_value = self.supabase_client_mock

        # Initialize the repository
        self.repository = SupabaseRepository()

    def tearDown(self):
        patch.stopall()

    def test_insert_product_success(self):
        # Mock the response from Supabase
        self.supabase_client_mock.table.return_value.upsert.return_value.execute.return_value.data = True

        # Create a mock product
        product = MagicMock()
        product.get_id.return_value = "123"
        product.get_nome.return_value = "Test Product"
        product.get_descrizione.return_value = "Test Description"
        product.get_etim.return_value = '{"key": "value"}'

        # Call the method
        response = self.repository.insert_product(product)

        # Assertions
        self.assertTrue(response.get_success())
        self.assertEqual(response.get_message(), "Product inserted successfully")
        self.supabase_client_mock.table.assert_called_once_with('prodotto')
        self.supabase_client_mock.table.return_value.upsert.assert_called_once_with({
            'id': "123",
            'nome': "Test Product",
            'descrizione': "Test Description",
            'etim': '{"key": "value"}'
        })

    def test_insert_product_failure(self):
        # Mock the Supabase client to raise an exception
        self.supabase_client_mock.table.return_value.upsert.side_effect = Exception("Database error")

        # Create a mock product
        product = MagicMock()
        product.get_id.return_value = "123"
        product.get_nome.return_value = "Test Product"
        product.get_descrizione.return_value = "Test Description"
        product.get_etim.return_value = '{"key": "value"}'

        # Call the method and assert it raises an exception
        with self.assertRaises(Exception) as context:
            self.repository.insert_product(product)
        self.assertEqual(str(context.exception), "Database error")

    def test_check_updated_file_found(self):
        # Mock the response from Supabase
        self.supabase_client_mock.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value.data = [{"updated": True}]

        # Create a mock file
        file = MagicMock()
        file.get_name.return_value = "test.pdf"

        # Call the method
        response = self.repository.check_updated_file(file)

        # Assertions
        self.assertTrue(response.get_success())
        self.assertTrue(response.get_message())
        self.supabase_client_mock.table.assert_called_once_with("manuale")
        self.supabase_client_mock.table.return_value.select.assert_called_once_with("*")
        self.supabase_client_mock.table.return_value.select.return_value.eq.assert_any_call("nome", "test.pdf")
        self.supabase_client_mock.table.return_value.select.return_value.eq.return_value.eq.assert_any_call("updated", True)

    def test_check_updated_file_not_found(self):
        # Mock the response to return no data
        self.supabase_client_mock.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value.data = []

        # Create a mock file
        file = MagicMock()
        file.get_name.return_value = "nonexistent.pdf"

        # Call the method
        response = self.repository.check_updated_file(file)

        # Assertions
        self.assertTrue(response.get_success())
        self.assertFalse(response.get_message())

    def test_upload_file_success(self):
        # Mock the response from Supabase
        self.supabase_client_mock.storage.from_.return_value.upload.return_value = True
        self.supabase_client_mock.storage.from_.return_value.list.return_value = [{"name": "test.pdf", "id": "file_id"}]

        # Create a mock file
        file = MagicMock()
        file.get_path.return_value = "path/to/test.pdf"
        file.get_name.return_value = "test.pdf"

        # Mock file opening
        with patch("builtins.open", new_callable=MagicMock) as mock_open:
            mock_open.return_value.__enter__.return_value = MagicMock()
            response = self.repository.upload_file(file)

        # Assertions
        self.assertTrue(response.get_success())
        self.assertEqual(response.get_objID(), "file_id")
        self.assertEqual(response.get_message(), "File uploaded successfully")

        # Verify the sequence of calls to `from_`
        self.supabase_client_mock.storage.from_.assert_has_calls([
            call('files'),  # First call for upload
            call().upload('pdfs/test.pdf', mock_open.return_value.__enter__.return_value, {'upsert': 'true'}),
            call('files'),  # Second call for listing files
            call().list('pdfs')
        ])

    def test_upload_file_invalid_path(self):
        # Create a mock file with an invalid path
        file = MagicMock()
        file.get_path.return_value = None
        file.get_name.return_value = "test.pdf"

        # Call the method and assert it raises an exception
        with self.assertRaises(Exception) as context:
            self.repository.upload_file(file)
        self.assertIn("expected str, bytes or os.PathLike object", str(context.exception))

    def test_upload_file_list_failure(self):
        # Mock the upload to succeed but listing files to fail
        self.supabase_client_mock.storage.from_.return_value.upload.return_value = True
        self.supabase_client_mock.storage.from_.return_value.list.side_effect = Exception("List error")

        # Create a mock file
        file = MagicMock()
        file.get_path.return_value = "path/to/test.pdf"
        file.get_name.return_value = "test.pdf"

        # Mock file opening
        with patch("builtins.open", new_callable=MagicMock) as mock_open:
            mock_open.return_value.__enter__.return_value = MagicMock()

            # Call the method and assert it raises an exception
            with self.assertRaises(Exception) as context:
                self.repository.upload_file(file)
            self.assertEqual(str(context.exception), "List error")

    def test_insert_file_success(self):
        # Mock the response from Supabase
        self.supabase_client_mock.table.return_value.upsert.return_value.execute.return_value.data = True

        # Create a mock file
        file = MagicMock()
        file.get_url.return_value = "https://example.com/test.pdf"
        file.get_name.return_value = "test.pdf"
        file.get_objID.return_value = "file_id"

        # Call the method
        response = self.repository.insert_file(file)

        # Assertions
        self.assertTrue(response.get_success())
        self.assertEqual(response.get_message(), "PDF inserted successfully")
        self.supabase_client_mock.table.assert_called_once_with('manuale')
        self.supabase_client_mock.table.return_value.upsert.assert_called_once_with({
            'link': "https://example.com/test.pdf",
            'nome': "test.pdf",
            'storage_object_id': "file_id",
            'updated': True
        })

    def test_insert_association_product_file_success(self):
        # Mock the response from Supabase
        self.supabase_client_mock.table.return_value.upsert.return_value.execute.return_value.data = True

        # Create mock product and file
        product = MagicMock()
        product.get_id.return_value = "123"

        file = MagicMock()
        file.get_url.return_value = "https://example.com/test.pdf"

        # Call the method
        response = self.repository.insert_association_product_file(product, file)

        # Assertions
        self.assertTrue(response.get_success())
        self.assertEqual(response.get_message(), "Association inserted successfully")
        self.supabase_client_mock.table.assert_called_once_with('prodotto_manuale')
        self.supabase_client_mock.table.return_value.upsert.assert_called_once_with({
            'prodotto': "123",
            'manuale': "https://example.com/test.pdf"
        })

    def test_insert_faq_success(self):
        # Mock the response from Supabase
        self.supabase_client_mock.table.return_value.upsert.return_value.execute.return_value.data = True

        # Create a mock FAQ
        faq = MagicMock()
        faq.get_productID.return_value = "123"
        faq.get_question.return_value = "What is this?"
        faq.get_answer.return_value = "This is a test."

        # Call the method
        response = self.repository.insert_faq(faq)

        # Assertions
        self.assertTrue(response.get_success())
        self.assertEqual(response.get_message(), "FAQ inserted successfully")
        self.supabase_client_mock.table.assert_called_once_with('qea')
        self.supabase_client_mock.table.return_value.upsert.assert_called_once_with({
            'prodotto': "123",
            'domanda': "What is this?",
            'risposta': "This is a test."
        })

    def test_end_update_success(self):
        # Mock the response from Supabase
        self.supabase_client_mock.table.return_value.update.return_value.eq.return_value.execute.return_value.data = True

        # Call the method
        response = self.repository.end_update()

        # Assertions
        self.assertTrue(response.get_success())
        self.assertEqual(response.get_message(), "Update completed successfully")
        self.supabase_client_mock.table.assert_called_once_with('manuale')
        self.supabase_client_mock.table.return_value.update.assert_called_once_with({'updated': False})
        self.supabase_client_mock.table.return_value.update.return_value.eq.assert_called_once_with('updated', True)

    def test_insert_association_product_file_no_data(self):
        self.supabase_client_mock.table.return_value.upsert.return_value.execute.return_value.data = None

        product = MagicMock()
        product.get_id.return_value = "123"
        file = MagicMock()
        file.get_url.return_value = "https://example.com/test.pdf"

        response = self.repository.insert_association_product_file(product, file)

        self.assertFalse(response.get_success())
        self.assertEqual(response.get_message(), "Failed to insert association")

    def test_insert_file_no_data(self):
        self.supabase_client_mock.table.return_value.upsert.return_value.execute.return_value.data = None

        file = MagicMock()
        file.get_url.return_value = "https://example.com/test.pdf"
        file.get_name.return_value = "test.pdf"
        file.get_objID.return_value = "file_id"

        response = self.repository.insert_file(file)

        self.assertFalse(response.get_success())
        self.assertEqual(response.get_message(), "Failed to insert PDF")

    def test_insert_faq_no_data(self):
        self.supabase_client_mock.table.return_value.upsert.return_value.execute.return_value.data = None

        faq = MagicMock()
        faq.get_productID.return_value = "123"
        faq.get_question.return_value = "What is this?"
        faq.get_answer.return_value = "This is a test."

        response = self.repository.insert_faq(faq)

        self.assertFalse(response.get_success())
        self.assertEqual(response.get_message(), "Failed to insert FAQ")


    def test_end_update_no_data(self):
        self.supabase_client_mock.table.return_value.update.return_value.eq.return_value.execute.return_value.data = None

        response = self.repository.end_update()

        self.assertFalse(response.get_success())
        self.assertEqual(response.get_message(), "Failed to complete update")

    def test_check_updated_file_exception(self):
        self.supabase_client_mock.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.side_effect = Exception("Query failed")

        file = MagicMock()
        file.get_name.return_value = "test.pdf"

        with self.assertRaises(Exception) as context:
            self.repository.check_updated_file(file)
        self.assertEqual(str(context.exception), "Query failed")
    
    def test_upload_file_not_found_after_upload(self):
        self.supabase_client_mock.storage.from_.return_value.upload.return_value = True
        self.supabase_client_mock.storage.from_.return_value.list.return_value = [{"name": "other.pdf", "id": "wrong_id"}]

        file = MagicMock()
        file.get_path.return_value = "path/to/test.pdf"
        file.get_name.return_value = "test.pdf"

        with patch("builtins.open", new_callable=MagicMock) as mock_open:
            mock_open.return_value.__enter__.return_value = MagicMock()

            response = self.repository.upload_file(file)

        self.assertIsNone(response)  # Nessun file trovato con il nome giusto


if __name__ == '__main__':
    unittest.main()