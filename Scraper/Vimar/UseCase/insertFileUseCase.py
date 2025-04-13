from abc import ABC, abstractmethod

from ..models.file import FilePdf
from ..models.dbInsertOperationResponse import DbInsertOperationResponse

class InsertFileUseCase(ABC):
    @abstractmethod
    def insert_file(self, file: FilePdf) -> DbInsertOperationResponse:
        """
        Insert a file into the database.
        
        Args:
            file: The file to insert.
        
        Returns:
            db_insert_operation_response: True if the file was inserted successfully, False otherwise.
        """
