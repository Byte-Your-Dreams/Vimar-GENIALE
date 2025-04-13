from abc import ABC, abstractmethod

from ..models.file import FilePdf
from ..models.dbUploadOperationResponse import DbUploadOperationResponse

class UploadFilePort(ABC):
    @abstractmethod
    def upload_file(self, file: FilePdf) -> DbUploadOperationResponse:
        """
        Upload a file to a storage service.
        
        Args:
            file: The file to upload.
        
        Returns:
            db_upload_operation_response: The response of the upload operation.
        """