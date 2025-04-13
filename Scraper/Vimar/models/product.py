class Product:
    def __init__(self, id: str, name: str, description: str, etim: str):
        self.__id = id
        self.__name = name
        self.__description = description
        self.__etim = etim
    
    def get_id(self) -> str:
        return self.__id
    
    def get_name(self) -> str:
        return self.__name
    
    def get_description(self) -> str:
        return self.__description
    
    def get_etim(self) -> str:
        return self.__etim