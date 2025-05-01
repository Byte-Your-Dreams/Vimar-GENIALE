import unittest
from unittest.mock import MagicMock, patch, call
from Vimar.pipelines import DBPipeline
from Vimar.items import ProductItem

class TestDBPipeline(unittest.TestCase):
    def setUp(self):
        # Initialize the pipeline
        self.pipeline = DBPipeline()

        # Mock the dependency injection services
        self.pipeline.initService = {
            'insert_product_service': MagicMock(),
            'check_updated_file_service': MagicMock(),
            'upload_file_service': MagicMock(),
            'insert_file_service': MagicMock(),
            'insert_association_product_file_service': MagicMock(),
            'insert_faq_service': MagicMock(),
            'end_update_service': MagicMock(),
        }

        # Assign mocked services to pipeline attributes
        self.pipeline.insertProductUseCase = self.pipeline.initService['insert_product_service']
        self.pipeline.checkUpdatedFileUseCase = self.pipeline.initService['check_updated_file_service']
        self.pipeline.uploadFileUseCase = self.pipeline.initService['upload_file_service']
        self.pipeline.insertFileUseCase = self.pipeline.initService['insert_file_service']
        self.pipeline.insertAssociationProductFileUseCase = self.pipeline.initService['insert_association_product_file_service']
        self.pipeline.insertFaqUseCase = self.pipeline.initService['insert_faq_service']
        self.pipeline.endUpdateUseCase = self.pipeline.initService['end_update_service']

    @patch('Vimar.pipelines.Product')
    def test_process_basic_info(self, MockProduct):
        # Mock the response from the insert product service
        mock_response = MagicMock()
        mock_response.get_success = True
        self.pipeline.insertProductUseCase.insert_product.return_value = mock_response

        # Create a mock item
        item = ProductItem(ID='123', Nome='Test Product', Descrizione='Test Description', ETIM='ETIM123')

        # Call the method
        self.pipeline._process_basic_info(item)

        # Assert that the insert_product method was called with the correct arguments
        MockProduct.assert_called_once_with('123', 'Test Product', 'Test Description', 'ETIM123')
        self.pipeline.insertProductUseCase.insert_product.assert_called_once()

    @patch('Vimar.pipelines.DbCheckOperationResponse')
    @patch('Vimar.pipelines.FilePdf')
    def test_process_single_pdf(self, MockFilePdf, MockDbCheckOperationResponse):
        # Mock the response from the check_updated_file service
        mock_response = MockDbCheckOperationResponse.return_value
        mock_response.get_success.return_value = True  # Mock the get_success method
        mock_response.get_message.return_value = "File is already in DB"  # Mock the get_message method
        self.pipeline.checkUpdatedFileUseCase.check_updated_file.return_value = mock_response

        # Mock the PDF data
        pdf = {'path': 'test.pdf', 'url': 'http://example.com/test.pdf', 'content': b'%PDF-1.4'}
        mock_file = MockFilePdf.return_value

        # Mock the spider
        mock_spider = MagicMock()

        # Call the method
        self.pipeline._process_single_pdf(pdf, '123', mock_spider)

        # Assertions
        self.pipeline.checkUpdatedFileUseCase.check_updated_file.assert_called_once_with(mock_file)
        self.pipeline.insertAssociationProductFileUseCase.insert_association_product_file.assert_called_once()
        mock_spider.log.assert_called_with("PDF already in DB, merging...")

    def test_process_item(self):
        # Mock the item
        item = ProductItem(ID='123', Nome='Test Product', Descrizione='Test Description', ETIM='ETIM123', files=[], Faq=[])

        # Call the method
        result = self.pipeline.process_item(item, MagicMock())

        # Assert that the item is returned
        self.assertEqual(result, item)

    def test_close_spider(self):
        # Mock the response from the end_update service
        mock_response = MagicMock()
        self.pipeline.endUpdateUseCase.end_update.return_value = mock_response

        # Call the method
        self.pipeline.close_spider(MagicMock())

        # Assert that the end_update method was called
        self.pipeline.endUpdateUseCase.end_update.assert_called_once()

    @patch('Vimar.pipelines.Product')
    def test_process_basic_info_fail(self, MockProduct):
        mock_response = MagicMock()
        mock_response.get_success = False
        mock_response.get_message = "DB error"
        self.pipeline.insertProductUseCase.insert_product.return_value = mock_response

        item = ProductItem(ID='123', Nome='Test Product', Descrizione='Test Description', ETIM='ETIM123')

        with self.assertRaises(Exception) as context:
            self.pipeline._process_basic_info(item)

        self.assertIn("Failed to insert product into DB", str(context.exception))
    
    @patch('Vimar.pipelines.ocrmypdf.ocr', side_effect=Exception("OCR failed"))
    @patch('Vimar.pipelines.logging')
    def test_make_ocr_exception(self, mock_logging, mock_ocr):
        pdf = {'path': 'test.pdf'}
        self.pipeline._makeOcr(pdf)

        mock_ocr.assert_called_once()
        mock_logging.error.assert_called_once()

    @patch('Vimar.pipelines.DBPipeline._process_new_pdf')
    @patch('Vimar.pipelines.FilePdf')
    @patch('Vimar.pipelines.DbCheckOperationResponse')
    def test_process_single_pdf_new_file(self, MockDbCheckOperationResponse, MockFilePdf, mock_process_new_pdf):
        mock_response = MockDbCheckOperationResponse.return_value
        mock_response.get_success.return_value = True
        mock_response.get_message.return_value = ""  # simulate "new" file

        self.pipeline.checkUpdatedFileUseCase.check_updated_file.return_value = mock_response

        pdf = {'path': 'new.pdf', 'url': 'http://example.com/new.pdf'}
        mock_spider = MagicMock()

        self.pipeline._process_single_pdf(pdf, '456', mock_spider)

        mock_process_new_pdf.assert_called_once_with(pdf, '456', mock_spider)
        mock_spider.log.assert_called_with("PDF not in DB, processing...")




if __name__ == '__main__':
    unittest.main()