from abc import ABC, abstractmethod

from ..models.faq import Faq
from ..models.dbInsertOperationResponse import DbInsertOperationResponse

class InsertFaqUseCase(ABC):
    @abstractmethod
    def insert_faq(self, faq: Faq) -> DbInsertOperationResponse:
        """
        Insert a faq into the database.
        
        Args:
            faq: The faq to insert.
        
        Returns:
            db_insert_operation_response: True if the faq was inserted successfully, False otherwise.
        """