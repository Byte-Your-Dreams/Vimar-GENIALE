from ..UseCase.endUpdateUseCase import EndUpdateUseCase
from ..ports.endUpdatePort import EndUpdatePort
from ..models.dbInsertOperationResponse import DbInsertOperationResponse


class EndUpdateService(EndUpdateUseCase):
    def __init__(self, end_update_port: EndUpdatePort):
        self.__end_update_port = end_update_port
        
    def end_update(self) -> DbInsertOperationResponse:
        try:
            return self.__end_update_port.end_update()
        except Exception as e:
            #logger.error(f"Failed to end update: {e}")
            raise e