from ..UseCase.insertFileUseCase import InsertFileUseCase
from ..models.dbInsertOperationResponse import DbInsertOperationResponse
from ..models.file import FilePdf
from ..ports.insertFilePort import InsertFilePort

class InsertFileService(InsertFileUseCase):
    """
    Service for inserting a file into the database.
    """

    def __init__(self, insert_file_port: InsertFilePort):
        self.__insert_file_port = insert_file_port

    def insert_file(self, file: FilePdf) -> DbInsertOperationResponse:
        try:
            return self.__insert_file_port.insert_file(file)
        except Exception as e:
            #logger.error(f"Failed to save message: {e}")
            raise e