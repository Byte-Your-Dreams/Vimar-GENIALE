import os, json, logging
from supabase import create_client, Client
#from beartype.typing import Optional, Tuple

from ..entities.supabaseInsertOperationResponse import SupabaseInsertOperationResponse
from ..entities.supabaseCheckOperationResponse import SupabaseCheckOperationResponse
from ..entities.supabaseUploadOperationResponse import SupabaseUploadOperationResponse
from ..entities.supabaseFile import SupabaseFile
from ..entities.supabaseProduct import SupabaseProduct
from ..entities.supabaseFaq import SupabaseFaq

#from utils.logger import logger
#from utils.beartype_personalized import beartype_personalized

#@beartype_personalized
class SupabaseRepository():
    def __init__(self):
        url: str = os.getenv("SUPABASE_URL")
        key: str = os.getenv("SERVICE_ROLE_KEY")
        self.supabase: Client = create_client(url, key)
    
    def insert_product(self, product: SupabaseProduct) -> SupabaseInsertOperationResponse:
        try:
            response = self.supabase.table('prodotto').upsert({
                'id': product.get_id(),
                'nome': product.get_nome(),
                'descrizione': product.get_descrizione(),
                'etim': product.get_etim()  # Already JSON string from adapter
            }).execute()
            if response.data:
                #logger.info(f"Product inserted successfully: {product.get_id()}")
                return SupabaseInsertOperationResponse(True, "Product inserted successfully")
            return SupabaseInsertOperationResponse(False, "Failed to insert product")
        except Exception as e:
            #logger.error(f"Failed to insert product: {e}")
            raise e
        
    def check_updated_file(self, file: SupabaseFile) -> SupabaseCheckOperationResponse:
        try: 
            response = self.supabase.table("manuale").select("*").eq("nome", file.get_name()).eq("updated", True).execute()
            if response.data and len(response.data) > 0:
                return SupabaseCheckOperationResponse(True, True)
            return SupabaseCheckOperationResponse(True, False)
        except Exception as e:
            #logger.error(f"Failed to check file: {e}")
            raise e
    
    def upload_file (self, file: SupabaseFile) -> SupabaseUploadOperationResponse:
        try:
            with open(file.get_path(), 'rb') as f:
                response = self.supabase.storage.from_('files').upload(f'pdfs/{file.get_name()}', f, {'upsert': 'true'})
                if response:
                    #logger.info(f"File uploaded successfully: {response}")
                    files = self.supabase.storage.from_('files').list('pdfs')
                    #logger.info(f"Files: {files}")
                    for single_file in files:
                        if single_file['name'] == file.get_name():
                            return SupabaseUploadOperationResponse(True, single_file['id'], 'File uploaded successfully')
        except Exception as e:
            #logger.error(f"Failed to upload file: {e}")
            raise e
        
    def insert_file(self, file: SupabaseFile) -> SupabaseInsertOperationResponse:
        try:
            
            response = self.supabase.table('manuale').upsert({
                'link': file.get_url(),
                'nome': file.get_name(),
                'storage_object_id': file.get_objID(),
                'updated': True
            }).execute()
            if response.data:
                #logger.info(f"PDF inserted successfully: {file.get_name()}")
                return SupabaseInsertOperationResponse(True, "PDF inserted successfully")
            return SupabaseInsertOperationResponse(False, "Failed to insert PDF")
        except Exception as e:
            #logger.error(f"Failed to insert PDF: {e}")
            raise e
        
    def insert_association_product_file(self, product: SupabaseProduct, file: SupabaseFile) -> SupabaseInsertOperationResponse:
        try:
            response = self.supabase.table('prodotto_manuale').upsert({
                'prodotto': product.get_id(),
                'manuale': file.get_url()
            }).execute()
            if response.data:
                #logger.info(f"Association inserted successfully: {product.get_id()} - {file.get_path()}")
                return SupabaseInsertOperationResponse(True, "Association inserted successfully") 
            return SupabaseInsertOperationResponse(False, "Failed to insert association")
        except Exception as e:
            #logger.error(f"Failed to insert association: {e}")
            raise e
    
    def insert_faq(self, faq: SupabaseFaq) -> SupabaseInsertOperationResponse:
        try:
            response = self.supabase.table('qea').upsert({
                'prodotto': faq.get_productID(),
                'domanda': faq.get_question(),
                'risposta': faq.get_answer()
            }).execute()
            if response.data:
                #logger.info(f"FAQ inserted successfully: {product.get_id()} - {question}")
                return SupabaseInsertOperationResponse(True, "FAQ inserted successfully")
            return SupabaseInsertOperationResponse(False, "Failed to insert FAQ")
        except Exception as e:
            #logger.error(f"Failed to insert FAQ: {e}")
            raise e

    def end_update(self) -> SupabaseInsertOperationResponse:
        try:
            response = self.supabase.table('manuale').update({
                'updated': False }).eq('updated', True).execute()
            if response.data:
                #logger.info("Update completed successfully")
                return SupabaseInsertOperationResponse(True, "Update completed successfully")
            return SupabaseInsertOperationResponse(False, "Failed to complete update")
        except Exception as e:
            #logger.error(f"Failed to complete update: {e}")
            raise e
            