class RoutingDomainException(Exception):
    """Base exception for routing domain errors"""

class RouteWithoutStopsException(RoutingDomainException):
    """Raised when trying to start a route without stops"""

class InvalidRouteStatusTransitionException(RoutingDomainException):
    """Raised when an invalid status transition is attempted"""

class RouteModificationException(RoutingDomainException):
    """Raised when trying to modify a completed or cancelled route"""

class StopModificationException(RoutingDomainException):
    """Raised when trying to remove stops from an in progress route"""

class DuplicateStopOrderException(RoutingDomainException):
    """Raised when stop order is not unique"""
