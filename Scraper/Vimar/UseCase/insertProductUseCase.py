from abc import ABC, abstractmethod

from ..models.product import Product
from ..models.dbInsertOperationResponse import DbInsertOperationResponse

#from utils.beartype_personalized import beartype_personalized

#@beartype_personalized
class InsertProductUseCase(ABC):
    @abstractmethod
    def insert_product(self, product: Product) -> DbInsertOperationResponse:
        """
        Inserts a product into the database.
        
        Args:
            product: The product to insert.
        
        Returns:
            db_insert_operation_response: True if the product was inserted successfully, False otherwise.
        """
