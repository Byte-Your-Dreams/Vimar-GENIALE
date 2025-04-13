from abc import ABC, abstractmethod

from ..models.file import FilePdf
from ..models.product import Product
from ..models.dbInsertOperationResponse import DbInsertOperationResponse

class InsertAssociationProductFileUseCase(ABC):
    @abstractmethod
    def insert_association_product_file(self, product: Product, file: FilePdf) -> DbInsertOperationResponse:
        """
        Insert an association between a product and a file into the database.
        
        Args:
            product: The product to associate.
            file: The file to associate.
        
        Returns:
            db_insert_operation_response: True if the association was inserted successfully, False otherwise.
        """