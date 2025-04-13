from ..UseCase.insertFaqUseCase import InsertFaqUseCase
from ..models.dbInsertOperationResponse import DbInsertOperationResponse
from ..models.faq import Faq
from ..ports.insertFaqPort import InsertFaqPort

class InsertFaqService(InsertFaqUseCase):
    """
    Service for inserting a faq into the database.
    """

    def __init__(self, insert_faq_port: InsertFaqPort):
        self.__insert_faq_port = insert_faq_port

    def insert_faq(self, faq: Faq) -> DbInsertOperationResponse:
        try:
            return self.__insert_faq_port.insert_faq(faq)
        except Exception as e:
            #logger.error(f"Failed to save message: {e}")
            raise e