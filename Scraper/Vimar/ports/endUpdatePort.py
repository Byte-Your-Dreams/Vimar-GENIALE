from abc import ABC, abstractmethod

from ..models.dbInsertOperationResponse import DbInsertOperationResponse

class EndUpdatePort(ABC):
    @abstractmethod
    def end_update(self) -> DbInsertOperationResponse:
        """
        End the update process.
        
        Returns:
            db_insert_operation_response: True if the update was completed, False otherwise.
        """