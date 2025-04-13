from ..UseCase.insertAssociationProductFileUseCase import InsertAssociationProductFileUseCase
from ..models.dbInsertOperationResponse import DbInsertOperationResponse
from ..models.file import FilePdf
from ..models.product import Product
from ..ports.insertAssociationProductFilePort import InsertAssociationProductFilePort

class InsertAssociationProductFileService(InsertAssociationProductFileUseCase):
    """
    Service for inserting an association between a product and a file into the database.
    """

    def __init__(self, insert_association_product_file_port: InsertAssociationProductFilePort):
        self.__insert_association_product_file_port = insert_association_product_file_port

    def insert_association_product_file(self, product: Product, file: FilePdf) -> DbInsertOperationResponse:
        try:
            return self.__insert_association_product_file_port.insert_association_product_file(product, file)
        except Exception as e:
            #logger.error(f"Failed to save message: {e}")
            raise e