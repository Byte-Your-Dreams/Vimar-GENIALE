from abc import ABC, abstractmethod

from ..models.file import FilePdf
from ..models.dbCheckOperationResponse import DbCheckOperationResponse

class CheckUpdatedFilePort(ABC):
    @abstractmethod
    def check_updated_file(self, file: FilePdf) -> DbCheckOperationResponse:
        """
        Check if a file is already updated in supabase.
        
        Args:
            file: The file to check.
        
        Returns:
            db_check_operation_response: True if the file is updated, False otherwise.
        """