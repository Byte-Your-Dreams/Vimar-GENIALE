from ..UseCase.insertProductUseCase import InsertProductUseCase
from ..models.dbInsertOperationResponse import DbInsertOperationResponse
from ..ports.insertProductPort import InsertProductPort
from ..models.product import Product

#from utils.logger import logger
#from utils.beartype_personalized import beartype_personalized

#@beartype_personalized
class InsertProductService(InsertProductUseCase):
    """
    Service for inserting a product into the database.
    """

    def __init__(self, insert_product_port: InsertProductPort):
        self.__insert_product_port = insert_product_port

    def insert_product(self, product: Product) -> DbInsertOperationResponse:
        try:
            return self.__insert_product_port.insert_product(product)
        except Exception as e:
            #logger.error(f"Failed to save message: {e}")
            raise e