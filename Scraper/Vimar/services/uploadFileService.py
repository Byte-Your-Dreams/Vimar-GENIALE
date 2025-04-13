from ..UseCase.uploadFileUseCase import UploadFileUseCase
from ..models.dbUploadOperationResponse import DbUploadOperationResponse
from ..ports.uploadFilePort import UploadFilePort
from ..models.file import FilePdf

class UploadFileService(UploadFileUseCase):
    """
    Service for uploading a file into the database.
    """

    def __init__(self, upload_file_port: UploadFilePort):
        self.__upload_file_port = upload_file_port

    def upload_file(self, file: FilePdf) -> DbUploadOperationResponse:
        try:
            return self.__upload_file_port.upload_file(file)
        except Exception as e:
            #logger.error(f"Failed to save message: {e}")
            raise e
