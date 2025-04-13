class FilePdf:
    def __init__(self, path: str, url: str, objID: str = ''):
        self.path = path
        self.objID = objID
        self.url = url
    def get_path(self) -> str:
        return self.path
    def get_objID(self) -> str:
        return self.objID
    def get_url(self) -> str:
        return self.url
    def get_name(self) -> str:
        return self.path.split('/')[-1]
    def set_objID(self, objID: str):
        self.objID = objID