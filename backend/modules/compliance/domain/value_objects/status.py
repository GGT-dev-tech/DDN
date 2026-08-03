from enum import Enum


class MTRStatus(str, Enum):
    DRAFT = "DRAFT"
    ISSUED = "ISSUED"
    RECEIVED = "RECEIVED"
    CANCELED = "CANCELED"
