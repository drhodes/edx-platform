""" Program Enrollments API v1 URLs. """
from __future__ import absolute_import

from django.conf import settings
from django.conf.urls import url

from lms.djangoapps.program_enrollments.api.v1.constants import PROGRAM_UUID_PATTERN
from lms.djangoapps.program_enrollments.api.v1.views import (
    EnrollmentDataResetView,
    ProgramEnrollmentsView,
    ProgramCourseEnrollmentsView,
    ProgramCourseEnrollmentOverviewView,
    LearnerProgramEnrollmentsView,
)
from openedx.core.constants import COURSE_ID_PATTERN

app_name = 'lms.djangoapps.program_enrollments'

urlpatterns = [
    url(
        r'^programs/enrollments/$',
        LearnerProgramEnrollmentsView.as_view(),
        name='learner_program_enrollments'
    ),
    url(
        r'^programs/{program_uuid}/enrollments/$'.format(program_uuid=PROGRAM_UUID_PATTERN),
        ProgramEnrollmentsView.as_view(),
        name='program_enrollments'
    ),
    url(
        r'^programs/{program_uuid}/courses/{course_id}/enrollments/'.format(
            program_uuid=PROGRAM_UUID_PATTERN,
            course_id=COURSE_ID_PATTERN
        ),
        ProgramCourseEnrollmentsView.as_view(),
        name="program_course_enrollments"
    ),
    url(
        r'^programs/{program_uuid}/overview/'.format(
            program_uuid=PROGRAM_UUID_PATTERN,
        ),
        ProgramCourseEnrollmentOverviewView.as_view(),
        name="program_course_enrollments_overview"
    ),
]

# TODO: should I create separate subfolder just for admin?? /program_enrollments/admin/etc???
sandbox_admin_patterns = [
    url(
        r'admin/programs/{program_uuid}/integration-reset'.format(
            program_uuid=PROGRAM_UUID_PATTERN
        ),
        EnrollmentDataResetView.as_view(),
        name="reset_enrollment_data"
    )
]

if settings.FEATURES.get('ENABLE_ENROLLMENT_RESET'):
    urlpatterns += sandbox_admin_patterns