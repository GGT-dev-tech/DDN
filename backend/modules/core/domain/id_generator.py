import uuid

from uuid6 import uuid7


class IdGenerator:
    """
    Abstração para geração de identificadores opacos no Domínio.
    Esconde a dependência direta de bibliotecas de UUID específicas (ex: uuid6.uuid7).
    """
    
    @staticmethod
    def generate() -> uuid.UUID:
        """
        Gera um identificador único, ordenável no tempo (atualmente UUIDv7).
        """
        return uuid7()
