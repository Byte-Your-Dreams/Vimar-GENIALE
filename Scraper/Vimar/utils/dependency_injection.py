import os

# services
from ..services.insertProductService import InsertProductService
from ..services.CheckUpdatedFileService import CheckUpdatedFileService
from ..services.uploadFileService import UploadFileService
from ..services.insertFileService import InsertFileService
from ..services.insertAssociationProductFileService import InsertAssociationProductFileService
from ..services.insertFaqService import InsertFaqService
from ..services.endUpdateService import EndUpdateService

# adapters
from ..adapters.supabaseAdapter import SupabaseAdapter

# repositories
from ..repositories.supabaseRepository import SupabaseRepository

def initialize_supabase() -> SupabaseAdapter:
    """
    Initialize the SupabaseAdapter
    """
    try:
        supabase_repository = SupabaseRepository()
        supabase_adapter = SupabaseAdapter(supabase_repository)
        return supabase_adapter
    except Exception as e:
        raise e
    
def dependency_injection_scraper() -> dict[str, object]:
    """
    Dependency injection for the scraper
    """
    try:
        # Supabase
        supabase_repository = SupabaseRepository()
        supabase_adapter = initialize_supabase()

        # InsertProduct
        insert_product_service = InsertProductService(supabase_adapter)
        # Check file
        check_updated_file_service = CheckUpdatedFileService(supabase_adapter)
        upload_file_service = UploadFileService(supabase_adapter)
        # Insert file
        insert_file_service = InsertFileService(supabase_adapter)
        # Insert association product file
        insert_association_product_file_service = InsertAssociationProductFileService(supabase_adapter)
        # Insert faq
        insert_faq_service = InsertFaqService(supabase_adapter)
        # End update
        end_update_service = EndUpdateService(supabase_adapter)

        return {
            "repository": supabase_repository,
            "insert_product_service": insert_product_service,
            "check_updated_file_service": check_updated_file_service,
            "upload_file_service": upload_file_service,
            "insert_file_service": insert_file_service,
            "insert_association_product_file_service": insert_association_product_file_service,
            "insert_faq_service": insert_faq_service,
            "end_update_service": end_update_service
        }
    except Exception as e:
        raise e