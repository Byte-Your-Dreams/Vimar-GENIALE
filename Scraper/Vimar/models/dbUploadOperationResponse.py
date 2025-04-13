class DbUploadOperationResponse:
    def __init__(self, success: bool, objID: str, message: str):
        self.success = success
        self.objID = objID
        self.message = message
    
    def get_success(self) -> bool:
        return self.success
    
    def get_objID(self) -> str:
        return self.objID
    
    def get_message(self) -> str:
        return self.message