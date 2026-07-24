class RoutingDomainException(Exception):
    """Base exception for routing domain errors"""
    pass

class RouteWithoutStopsException(RoutingDomainException):
    """Raised when trying to start a route without stops"""
    pass

class InvalidRouteStatusTransitionException(RoutingDomainException):
    """Raised when an invalid status transition is attempted"""
    pass

class RouteModificationException(RoutingDomainException):
    """Raised when trying to modify a completed or cancelled route"""
    pass

class StopModificationException(RoutingDomainException):
    """Raised when trying to remove stops from an in progress route"""
    pass

class DuplicateStopOrderException(RoutingDomainException):
    """Raised when stop order is not unique"""
    pass
