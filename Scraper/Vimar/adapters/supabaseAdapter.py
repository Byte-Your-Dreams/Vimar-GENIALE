from ..ports.insertProductPort import InsertProductPort
from ..ports.insertFilePort import InsertFilePort
from ..ports.checkUpdatedFilePort import CheckUpdatedFilePort
from ..ports.uploadFilePort import UploadFilePort
from ..ports.insertAssociationProductFilePort import InsertAssociationProductFilePort
from ..ports.insertFaqPort import InsertFaqPort
from ..ports.endUpdatePort import EndUpdatePort
from ..repositories.supabaseRepository import SupabaseRepository
from ..models.product import Product
from ..models.file import FilePdf
from ..models.faq import Faq

from ..models.dbInsertOperationResponse import DbInsertOperationResponse
from ..models.dbCheckOperationResponse import DbCheckOperationResponse
from ..models.dbUploadOperationResponse import DbUploadOperationResponse

from ..entities.supabaseInsertOperationResponse import SupabaseInsertOperationResponse
from ..entities.supabaseCheckOperationResponse import SupabaseCheckOperationResponse
from ..entities.supabaseUploadOperationResponse import SupabaseUploadOperationResponse

from ..entities.supabaseProduct import SupabaseProduct
from ..entities.supabaseFile import SupabaseFile
from ..entities.supabaseFaq import SupabaseFaq
import json

#from utils.logger import logger
#from utils.beartype_personalized import beartype_personalized

#@beartype_personalized
class SupabaseAdapter(InsertProductPort, InsertFilePort, CheckUpdatedFilePort, UploadFilePort, InsertAssociationProductFilePort, InsertFaqPort, EndUpdatePort):
    """
    Adapter class for interacting with a supabase istance
    """

    def __init__(self, repository: SupabaseRepository):
        self.__repository = repository

    def insert_product(self, product: Product) -> DbInsertOperationResponse:
        try:
            supabase_product = self.__supabase_product_converter(product)
            supabase_response = self.__repository.insert_product(supabase_product)
            return self.__db_insert_operation_response_converter(supabase_response)
        except Exception as e:
            #logger.error(f"Failed to insert product: {e}")
            raise e
    
    def check_updated_file(self, file: FilePdf) -> DbCheckOperationResponse:
        try:
            supabase_file = self.__supabase_file_converter(file)
            supabase_response = self.__repository.check_updated_file(supabase_file)
            return self.__db_check_operation_response_converter(supabase_response)
        except Exception as e:
            #logger.error(f"Failed to check file: {e}")
            raise e
        
    def upload_file(self, file: FilePdf) -> DbUploadOperationResponse:
        try:
            supabase_file = self.__supabase_file_converter(file)
            supabase_response = self.__repository.upload_file(supabase_file)
            output = self.__db_upload_operation_response_converter(supabase_response)
            return output
        except Exception as e:
            #logger.error(f"Failed to upload file: {e}")
            raise e

    def insert_file(self, file: FilePdf) -> DbInsertOperationResponse:
        try:
            supabase_file = self.__supabase_file_converter(file)
            supabase_response = self.__repository.insert_file(supabase_file)
            return self.__db_insert_operation_response_converter(supabase_response)
        except Exception as e:
            #logger.error(f"Failed to insert file: {e}")
            raise e
    
    def insert_association_product_file(self, product: Product, file: FilePdf) -> DbInsertOperationResponse:
        try:
            supabase_product = self.__supabase_product_converter(product)
            supabase_file = self.__supabase_file_converter(file)
            supabase_response = self.__repository.insert_association_product_file(supabase_product, supabase_file)
            return self.__db_insert_operation_response_converter(supabase_response)
        except Exception as e:
            #logger.error(f"Failed to insert association product pdf: {e}")
            raise e
        
    def insert_faq(self, faq: Faq) -> DbInsertOperationResponse:
        try:
            supabase_faq = self.__supabase_faq_converter(faq)
            supabase_response = self.__repository.insert_faq(supabase_faq)
            return self.__db_insert_operation_response_converter(supabase_response)
        except Exception as e:
            #logger.error(f"Failed to insert faq: {e}")
            raise e

    def end_update(self) -> DbInsertOperationResponse:
        try:
            supabase_response = self.__repository.end_update()
            return self.__db_insert_operation_response_converter(supabase_response)
        except Exception as e:
            #logger.error(f"Failed to end update: {e}")
            raise e

    def __supabase_product_converter(self, product: Product) -> SupabaseProduct:
        if not product:
            raise ValueError("Product is required")

        # Parse ETIM string as JSON if it's not empty, otherwise use empty dict
        try:
            etim_dict = json.loads(product.get_etim()) if product.get_etim() else {}
        except json.JSONDecodeError:
            etim_dict = {}

        # Convert ETIM dict back to JSON string for storage
        etim_json = json.dumps(etim_dict)

        return SupabaseProduct(
            id=product.get_id(),
            nome=product.get_name(),
            descrizione=product.get_description(),
            etim=etim_json
        )

    def __supabase_file_converter(self, file: FilePdf) -> SupabaseFile:
        if not file:
            raise ValueError("File is required")

        return SupabaseFile(path=file.get_path(), url=file.get_url(), objID=file.get_objID())

    def __db_insert_operation_response_converter(self, supabase_response: SupabaseInsertOperationResponse) -> DbInsertOperationResponse:
        try:
            if not supabase_response.get_success():
                return DbInsertOperationResponse(False, "Failed to insert product")

            return DbInsertOperationResponse(True, supabase_response.get_message())
        except Exception as e:
            #logger.error(f"Failed to convert supabase response to db insert operation response: {e}")
            raise e
        
    def __db_check_operation_response_converter(self, supabase_response: SupabaseCheckOperationResponse) -> DbCheckOperationResponse:
        try:
            if not supabase_response.get_success():
                return DbCheckOperationResponse(False, "Failed to check file")

            return DbCheckOperationResponse(True, supabase_response.get_message())
        except Exception as e:
            #logger.error(f"Failed to convert supabase response to db check operation response: {e}")
            raise e
    
    def __db_upload_operation_response_converter(self, supabase_response: SupabaseUploadOperationResponse) -> DbUploadOperationResponse:
        try:
            if not supabase_response.get_success():
                return DbUploadOperationResponse(False, "", "Failed to upload file")
            return DbUploadOperationResponse(True, supabase_response.get_objID(), supabase_response.get_message())
        except Exception as e:
            #logger.error(f"Failed to convert supabase response to db upload operation response: {e}")
            raise e        
        
    def __supabase_faq_converter(self, faq: Faq) -> SupabaseFaq:
        if not faq:
            raise ValueError("Faq is required")

        return SupabaseFaq(
            productID=faq.get_productID(),
            question=faq.get_question(),
            answer=faq.get_answer()
        )