import os, ocrmypdf, logging
from scrapy.pipelines.files import FilesPipeline

from time import sleep
from .models.product import Product
from .models.file import FilePdf
from .models.faq import Faq
from .models.dbCheckOperationResponse import DbCheckOperationResponse
from .models.dbUploadOperationResponse import DbUploadOperationResponse
from .models.dbInsertOperationResponse import DbInsertOperationResponse

from .utils.dependency_injection import dependency_injection_scraper

logging.basicConfig(level=logging.INFO)

class CustomFilePipeline(FilesPipeline):
    def file_path(self, request, response=None, info=None, *, item=None):
        return request.url.split('/')[-1]
    

class DBPipeline(object):
    def open_spider(self, spider):
        self.initService = dependency_injection_scraper()
        self.insertProductUseCase = self.initService['insert_product_service']
        self.checkUpdatedFileUseCase = self.initService['check_updated_file_service']
        self.uploadFileUseCase = self.initService['upload_file_service']
        self.insertFileUseCase = self.initService['insert_file_service']
        self.insertAssociationProductFileUseCase = self.initService['insert_association_product_file_service']
        self.insertFaqUseCase = self.initService['insert_faq_service']
        self.endUpdateUseCase = self.initService['end_update_service']
        
        
    def close_spider(self, spider): 
        pass

    def process_item(self, item, spider):
        try:
            self._process_basic_info(item)
            self._process_pdfs(item, spider)
            self._process_faqs(item)
            return item
        except Exception as e:
            spider.log(f"Failed to insert item into DB: {e}")
            return item

    def _process_basic_info(self, item):
        product = Product(item['ID'], item['Nome'], item['Descrizione'], item['ETIM'])
        response = self.insertProductUseCase.insert_product(product)
        if not response.get_success:
            raise Exception(f"Failed to insert product into DB: {response.get_message}")

    def _process_pdfs(self, item, spider):
        for pdf in item['files']:
            self._process_single_pdf(pdf, item['ID'], spider)

    def _process_single_pdf(self, pdf, item_id, spider):
        file = FilePdf(pdf['path'], pdf['url'])
        response: DbCheckOperationResponse = self.checkUpdatedFileUseCase.check_updated_file(file)
        if response.get_success():
            if response.get_message():
                spider.log(f"PDF already in DB, merging...")
                self.insertAssociationProductFileUseCase.insert_association_product_file(Product(item_id, "", "", ""), file)
            else:
                spider.log(f"PDF not in DB, processing...")
                self._process_new_pdf(pdf, item_id, spider)
            

    def _process_new_pdf(self, pdf, item_id, spider):
        # self._makeOcr(pdf)
        
        file = FilePdf(f'pdfs/{pdf["path"]}', pdf['url'])
        response: DbUploadOperationResponse = self.uploadFileUseCase.upload_file(file)
        
        if not response.get_success():
            return

        file.set_objID(response.get_objID())
        response: DbInsertOperationResponse = self.insertFileUseCase.insert_file(file)
        if not response.get_success():
            spider.log(f"Failed to insert file into DB: {response.get_message()}")
            return

        self.insertAssociationProductFileUseCase.insert_association_product_file(Product(item_id, "", "", ""), file)

    def _process_faqs(self, item):
        for faq in item['Faq']:
            obj = Faq(item['ID'], faq['question'], faq['answer'])
            response = self.insertFaqUseCase.insert_faq(obj)
            if not response.get_success:
                raise Exception(f"Failed to insert FAQ into DB: {response.get_message}")
                    
    def close_spider(self, spider):
        try:
            response = self.endUpdateUseCase.end_update()
            if response:            
                spider.log('Scraper completato')
        except Exception as e:
            spider.log(f"Failed scrapy: {e}")
        
    def _makeOcr(self, pdf):
        inputFile = f'pdfs/{pdf['path']}'
        outputFile = f"{inputFile}_temp.pdf"
        try:
            ocrmypdf.ocr(inputFile, outputFile, language='ita', force_ocr=True)
            os.remove(inputFile)
            os.rename(outputFile, inputFile)
            logging.info(f"OCR completed successfully: {inputFile}")
        except Exception as e:
            logging.error(f"Failed to make OCR: {e}")
