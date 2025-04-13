from ..UseCase.checkUpdatedFileUseCase import CheckUpdatedFileUseCase
from ..models.dbCheckOperationResponse import DbCheckOperationResponse
from ..ports.checkUpdatedFilePort import CheckUpdatedFilePort
from ..models.file import FilePdf

class CheckUpdatedFileService(CheckUpdatedFileUseCase):
    """
    Service for checking if a file is updated in the database.
    """

    def __init__(self, check_updated_file_port: CheckUpdatedFilePort):
        self.__check_updated_file_port = check_updated_file_port

    def check_updated_file(self, file: FilePdf) -> DbCheckOperationResponse:
        try:
            return self.__check_updated_file_port.check_updated_file(file)
        except Exception as e:
            #logger.error(f"Failed to check file: {e}")
            raise e