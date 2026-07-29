"""Service Plan Domain — Exceptions."""


class ServicePlanError(Exception):
    """Base exception for Service Plan BC."""


class ServicePlanNotFoundError(ServicePlanError):
    """Raised when a ServicePlan cannot be found by ID."""


class ServicePlanAlreadyPublishedError(ServicePlanError):
    """Raised when trying to transition a plan that is already ACTIVE."""


class ServicePlanHasNoReadySchedulesError(ServicePlanError):
    """
    Raised by publish() when no ACTIVE schedule is ready.
    A schedule is ready when it has a non-empty CollectionPoint and a Recurrence.
    """


class ScheduleEditNotAllowedError(ServicePlanError):
    """
    Raised when trying to mutate a ServiceSchedule's CollectionPoint or Recurrence
    on a plan that is no longer in DRAFT status.
    """


class ScheduleNotFoundError(ServicePlanError):
    """Raised when a schedule_id is not found inside the plan's schedules collection."""


class InvalidRecurrenceWindowError(ServicePlanError):
    """Raised when Recurrence.start_time >= Recurrence.end_time."""


class InvalidPlanTransitionError(ServicePlanError):
    """Raised when a state transition is not allowed by the state machine."""


class OptimisticLockError(ServicePlanError):
    """
    Raised by the repository when the plan's version in the DB
    does not match the expected version (concurrent modification detected).
    """
