from abc import ABC, abstractmethod

from ..models.faq import Faq
from ..models.dbInsertOperationResponse import DbInsertOperationResponse

class InsertFaqPort(ABC):
    @abstractmethod
    def insert_faq(self, faq: Faq) -> DbInsertOperationResponse:
        """
        Insert a faq to supabase database service.
        
        Args:
            faq: The faq to insert.
        
        Returns:
            db_insert_operation_response: The response of the insert operation.
        """