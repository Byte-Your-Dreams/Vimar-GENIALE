#from utils.beartype_personalized import beartype_personalized

#@beartype_personalized
class SupabaseProduct:
    def __init__(self, id: str, nome: str, descrizione: str, etim: str):
        self.id = id
        self.nome = nome
        self.descrizione = descrizione
        self.etim = etim

    def get_id(self) -> str:
        return self.id

    def get_nome(self) -> str:
        return self.nome

    def get_descrizione(self) -> str:
        return self.descrizione

    def get_etim(self) -> str:
        return self.etim

    def __eq__(self, other) -> bool:
        if not isinstance(other, SupabaseProduct):
            return False
        return self.id == other.get_id() and self.nome == other.get_nome() and self.descrizione == other.get_descrizione() and self.etim == other.get_etim()
