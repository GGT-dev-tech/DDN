class CommercialDomainException(Exception):
    pass

class LeadQualificationException(CommercialDomainException):
    pass

class LeadStatusTransitionException(CommercialDomainException):
    pass

class CompanyDocumentException(CommercialDomainException):
    pass

class OpportunityException(CommercialDomainException):
    pass
