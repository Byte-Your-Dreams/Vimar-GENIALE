from abc import ABC, abstractmethod

from ..models.file import FilePdf
from ..models.dbUploadOperationResponse import DbUploadOperationResponse

class UploadFileUseCase(ABC):
    @abstractmethod
    def upload_file(self, file: FilePdf) -> DbUploadOperationResponse:
        """
        Uploads a file into the database.
        
        Args:
            file: The file to upload.
        
        Returns:
            db_upload_operation_response: True if the file was uploaded successfully, False otherwise.
        """