from enum import Enum


class MTRStatus(str, Enum):
    DRAFT = "DRAFT"
    ISSUED = "ISSUED"
    RECEIVED = "RECEIVED"
    CANCELED = "CANCELED"

class MTRUsageType(str, Enum):
    SINGLE_USE = "SINGLE_USE"
    MULTIPLE_USE = "MULTIPLE_USE"
