from abc import ABC, abstractmethod

from ..models.file import FilePdf
from ..models.dbInsertOperationResponse import DbInsertOperationResponse

class InsertFilePort(ABC):
    @abstractmethod
    def insert_file(self, file: FilePdf) -> DbInsertOperationResponse:
        """
        Insert a file to supabase database service.
        
        Args:
            file: The file to insert.
        
        Returns:
            db_insert_operation_response: The response of the insert operation.
        """