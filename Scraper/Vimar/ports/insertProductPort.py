from abc import ABC, abstractmethod

from ..models.product import Product
from ..models.dbInsertOperationResponse import DbInsertOperationResponse

class InsertProductPort(ABC):
    """
    Abstract base class for insert product to supabase.
    This class defines the interface for inserting a product into the database, which must be implemented
    by any concrete class that inherits form it
    """
    @abstractmethod
    def insert_product(self, product: Product) -> DbInsertOperationResponse:
        """
        Inserts a product into the database.
        
        Args:
            product: The product to insert.
        
        Returns:
            db_insert_operation_response: True if the product was inserted successfully, False otherwise.
        """
        
