#from utils.beartype_personalized import beartype_personalized

#@beartype_personalized
class DbInsertOperationResponse:
    def __init__(self, success: bool, message: str):
        self.__success = success
        self.__message = message

    def get_success(self) -> bool:
        return self.__success

    def get_message(self) -> str:
        return self.__message

    def __eq__(self, other) -> bool:
        if not isinstance(other, DbInsertOperationResponse):
            return False
        return self.__success == other.get_success() and self.__message == other.get_message()