"""
LMS (Learning Management System) Pydantic Models
Comprehensive schemas for all LMS functionality
"""
from pydantic import BaseModel, Field, EmailStr, ConfigDict, field_validator
from typing import List, Optional, Any, Dict
from datetime import datetime, date
from enum import Enum


# ============== ENUMS ==============

class CourseStatus(str, Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    ARCHIVED = "ARCHIVED"
    
class AssignmentStatus(str, Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    CLOSED = "CLOSED"
    
class SubmissionStatus(str, Enum):
    NOT_SUBMITTED = "NOT_SUBMITTED"
    SUBMITTED = "SUBMITTED"
    GRADED = "GRADED"
    LATE = "LATE"
    RESUBMIT = "RESUBMIT"

class AttendanceStatus(str, Enum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    LATE = "LATE"
    EXCUSED = "EXCUSED"
    HALF_DAY = "HALF_DAY"

class GradeType(str, Enum):
    ASSIGNMENT = "ASSIGNMENT"
    QUIZ = "QUIZ"
    EXAM = "EXAM"
    PROJECT = "PROJECT"
    PARTICIPATION = "PARTICIPATION"

class NotificationType(str, Enum):
    ASSIGNMENT = "ASSIGNMENT"
    GRADE = "GRADE"
    ATTENDANCE = "ATTENDANCE"
    ANNOUNCEMENT = "ANNOUNCEMENT"
    REMINDER = "REMINDER"
    MESSAGE = "MESSAGE"

class EventType(str, Enum):
    CLASS = "CLASS"
    EXAM = "EXAM"
    HOLIDAY = "HOLIDAY"
    MEETING = "MEETING"
    EXTRACURRICULAR = "EXTRACURRICULAR"


# ============== CLASS MODELS ==============

class ClassModel(BaseModel):
    """Class/Section data model"""
    model_config = ConfigDict(populate_by_name=True)
    
    id: Optional[str] = None
    school_code: str
    class_name: str = Field(..., description="e.g., 'Class 5', 'Grade 10'")
    section: str = Field(..., description="e.g., 'A', 'B', 'Morning'")
    academic_year: str = Field(..., description="e.g., '2024-2025'")
    class_teacher_id: Optional[str] = None
    student_ids: List[str] = []
    max_students: Optional[int] = 50
    room_number: Optional[str] = None
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class CreateClassRequest(BaseModel):
    class_name: str
    section: str
    academic_year: str
    class_teacher_id: Optional[str] = None
    room_number: Optional[str] = None
    max_students: int = 50


class UpdateClassRequest(BaseModel):
    class_name: Optional[str] = None
    section: Optional[str] = None
    class_teacher_id: Optional[str] = None
    room_number: Optional[str] = None
    max_students: Optional[int] = None
    is_active: Optional[bool] = None


# ============== COURSE MODELS ==============

class CourseModel(BaseModel):
    """Course/Subject data model"""
    model_config = ConfigDict(populate_by_name=True)
    
    id: Optional[str] = None
    school_code: str
    course_name: str
    course_code: str = Field(..., description="Unique course identifier")
    description: Optional[str] = None
    class_id: str
    teacher_id: str
    academic_year: str
    subject: str = Field(..., description="e.g., Mathematics, English, Science")
    credits: Optional[int] = None
    syllabus_url: Optional[str] = None
    status: CourseStatus = CourseStatus.DRAFT
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    enrolled_students: List[str] = []
    tags: List[str] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class CreateCourseRequest(BaseModel):
    course_name: str
    course_code: str
    class_id: str
    subject: str
    academic_year: str
    description: Optional[str] = None
    credits: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    tags: List[str] = []


class UpdateCourseRequest(BaseModel):
    course_name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[CourseStatus] = None
    syllabus_url: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    tags: Optional[List[str]] = None


class EnrollStudentRequest(BaseModel):
    student_ids: List[str]
    course_id: str


# ============== ASSIGNMENT MODELS ==============

class AssignmentModel(BaseModel):
    """Assignment data model"""
    model_config = ConfigDict(populate_by_name=True)
    
    id: Optional[str] = None
    course_id: str
    teacher_id: str
    school_code: str
    title: str
    description: str
    instructions: Optional[str] = None
    due_date: datetime
    total_points: int = 100
    assignment_type: GradeType = GradeType.ASSIGNMENT
    attachments: List[str] = []
    status: AssignmentStatus = AssignmentStatus.DRAFT
    allow_late_submission: bool = True
    late_penalty_percent: Optional[int] = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class CreateAssignmentRequest(BaseModel):
    course_id: str
    title: str
    description: str
    instructions: Optional[str] = None
    due_date: datetime
    total_points: int = 100
    assignment_type: GradeType = GradeType.ASSIGNMENT
    attachments: List[str] = []
    allow_late_submission: bool = True
    late_penalty_percent: int = 0


class UpdateAssignmentRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    instructions: Optional[str] = None
    due_date: Optional[datetime] = None
    total_points: Optional[int] = None
    status: Optional[AssignmentStatus] = None
    allow_late_submission: Optional[bool] = None
    late_penalty_percent: Optional[int] = None


# ============== SUBMISSION MODELS ==============

class SubmissionModel(BaseModel):
    """Student submission data model"""
    model_config = ConfigDict(populate_by_name=True)
    
    id: Optional[str] = None
    assignment_id: str
    student_id: str
    course_id: str
    submission_text: Optional[str] = None
    attachments: List[str] = []
    submitted_at: Optional[datetime] = None
    status: SubmissionStatus = SubmissionStatus.NOT_SUBMITTED
    score: Optional[float] = None
    max_score: Optional[int] = None
    feedback: Optional[str] = None
    graded_by: Optional[str] = None
    graded_at: Optional[datetime] = None
    is_late: bool = False
    attempt_number: int = 1
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class CreateSubmissionRequest(BaseModel):
    assignment_id: str
    submission_text: Optional[str] = None
    attachments: List[str] = []


class GradeSubmissionRequest(BaseModel):
    submission_id: str
    score: float
    feedback: Optional[str] = None


# ============== GRADE MODELS ==============

class GradeModel(BaseModel):
    """Student grade data model"""
    model_config = ConfigDict(populate_by_name=True)
    
    id: Optional[str] = None
    student_id: str
    course_id: str
    school_code: str
    assignment_id: Optional[str] = None
    grade_type: GradeType
    score: float
    max_score: float
    percentage: float
    letter_grade: Optional[str] = None
    comments: Optional[str] = None
    graded_by: str
    graded_at: datetime
    academic_term: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class GradeReport(BaseModel):
    """Grade report for a student in a course"""
    student_id: str
    student_name: str
    course_id: str
    course_name: str
    grades: List[GradeModel]
    total_score: float
    max_possible_score: float
    overall_percentage: float
    letter_grade: str
    class_rank: Optional[int] = None
    class_average: Optional[float] = None


# ============== ATTENDANCE MODELS ==============

class AttendanceModel(BaseModel):
    """Attendance record data model"""
    model_config = ConfigDict(populate_by_name=True)
    
    id: Optional[str] = None
    student_id: str
    class_id: str
    course_id: Optional[str] = None
    school_code: str
    date: date
    status: AttendanceStatus
    marked_by: str
    remarks: Optional[str] = None
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class MarkAttendanceRequest(BaseModel):
    class_id: str
    course_id: Optional[str] = None
    date: date
    attendance_records: List[Dict[str, Any]]  # [{student_id, status, remarks}]


class AttendanceReport(BaseModel):
    """Attendance report for a student"""
    student_id: str
    student_name: str
    class_id: str
    total_days: int
    present_days: int
    absent_days: int
    late_days: int
    excused_days: int
    attendance_percentage: float
    recent_absences: List[date]


# ============== ANNOUNCEMENT MODELS ==============

class AnnouncementModel(BaseModel):
    """Announcement data model"""
    model_config = ConfigDict(populate_by_name=True)
    
    id: Optional[str] = None
    school_code: str
    title: str
    content: str
    author_id: str
    author_role: str
    target_roles: List[str] = []  # TEACHER, STUDENT, PARENT
    target_classes: List[str] = []
    priority: str = "NORMAL"  # LOW, NORMAL, HIGH, URGENT
    attachments: List[str] = []
    is_pinned: bool = False
    published_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class CreateAnnouncementRequest(BaseModel):
    title: str
    content: str
    target_roles: List[str] = []
    target_classes: List[str] = []
    priority: str = "NORMAL"
    attachments: List[str] = []
    is_pinned: bool = False
    expires_at: Optional[datetime] = None


# ============== NOTIFICATION MODELS ==============

class NotificationModel(BaseModel):
    """Notification data model"""
    model_config = ConfigDict(populate_by_name=True)
    
    id: Optional[str] = None
    user_id: str
    school_code: str
    type: NotificationType
    title: str
    message: str
    link: Optional[str] = None
    related_id: Optional[str] = None  # assignment_id, grade_id, etc.
    is_read: bool = False
    is_email_sent: bool = False
    priority: str = "NORMAL"
    created_at: Optional[datetime] = None


class CreateNotificationRequest(BaseModel):
    user_ids: List[str]
    type: NotificationType
    title: str
    message: str
    link: Optional[str] = None
    related_id: Optional[str] = None
    send_email: bool = False


# ============== EVENT/CALENDAR MODELS ==============

class EventModel(BaseModel):
    """Calendar event data model"""
    model_config = ConfigDict(populate_by_name=True)
    
    id: Optional[str] = None
    school_code: str
    title: str
    description: Optional[str] = None
    event_type: EventType
    start_date: datetime
    end_date: datetime
    location: Optional[str] = None
    organizer_id: str
    target_classes: List[str] = []
    target_users: List[str] = []
    is_all_day: bool = False
    reminder_before_minutes: Optional[int] = 60
    recurrence: Optional[str] = None  # DAILY, WEEKLY, MONTHLY
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class CreateEventRequest(BaseModel):
    title: str
    description: Optional[str] = None
    event_type: EventType
    start_date: datetime
    end_date: datetime
    location: Optional[str] = None
    target_classes: List[str] = []
    target_users: List[str] = []
    is_all_day: bool = False
    reminder_before_minutes: int = 60


# ============== PARENT-STUDENT LINK MODELS ==============

class ParentStudentLinkModel(BaseModel):
    """Link between parent and student"""
    model_config = ConfigDict(populate_by_name=True)
    
    id: Optional[str] = None
    parent_id: str
    student_id: str
    school_code: str
    relationship: str = Field(..., description="Father, Mother, Guardian, etc.")
    is_primary_contact: bool = False
    can_view_grades: bool = True
    can_view_attendance: bool = True
    can_communicate_teachers: bool = True
    created_at: Optional[datetime] = None


class LinkParentStudentRequest(BaseModel):
    parent_id: str
    student_ids: List[str]
    relationship: str
    is_primary_contact: bool = False


# ============== ANALYTICS MODELS ==============

class ClassAnalytics(BaseModel):
    """Analytics for a class"""
    class_id: str
    class_name: str
    section: str
    total_students: int
    average_attendance: float
    average_grade: float
    assignments_completed: int
    assignments_pending: int
    top_performers: List[Dict[str, Any]]
    struggling_students: List[Dict[str, Any]]


class TeacherAnalytics(BaseModel):
    """Analytics for a teacher"""
    teacher_id: str
    teacher_name: str
    total_courses: int
    total_students: int
    total_assignments: int
    pending_grading: int
    average_class_performance: float
    courses_summary: List[Dict[str, Any]]


class StudentAnalytics(BaseModel):
    """Analytics for a student"""
    student_id: str
    student_name: str
    overall_gpa: float
    total_courses: int
    attendance_percentage: float
    assignments_completed: int
    assignments_pending: int
    average_score: float
    grades_by_subject: Dict[str, float]
    recent_performance_trend: str  # IMPROVING, DECLINING, STABLE


class SchoolAnalytics(BaseModel):
    """Analytics for entire school"""
    school_code: str
    school_name: str
    total_students: int
    total_teachers: int
    total_classes: int
    total_courses: int
    overall_attendance_rate: float
    overall_average_grade: float
    top_performing_classes: List[Dict[str, Any]]
    teacher_student_ratio: float
    recent_trends: Dict[str, Any]


# ============== BULK USER CREATION MODELS ==============

class BulkUserCreate(BaseModel):
    """Bulk user creation with auto-generated passwords"""
    name: str
    email: str
    mobile_number: Optional[str] = None
    role: str  # TEACHER, STUDENT, PARENT
    class_name: Optional[str] = None
    section: Optional[str] = None
    roll_number: Optional[str] = None
    subject: Optional[str] = None  # For teachers
    parent_relationship: Optional[str] = None  # For parents


class BulkUserCreateResponse(BaseModel):
    """Response for bulk user creation"""
    success_count: int
    failed_count: int
    created_users: List[Dict[str, Any]]
    failed_users: List[Dict[str, Any]]
    passwords: Dict[str, str]  # email: password mapping


# ============== TIMETABLE MODELS ==============

class TimetableSlot(BaseModel):
    """Individual timetable slot"""
    day_of_week: int = Field(..., ge=0, le=6, description="0=Monday, 6=Sunday")
    start_time: str = Field(..., description="HH:MM format")
    end_time: str = Field(..., description="HH:MM format")
    course_id: str
    teacher_id: str
    room_number: Optional[str] = None


class TimetableModel(BaseModel):
    """Class timetable"""
    model_config = ConfigDict(populate_by_name=True)
    
    id: Optional[str] = None
    class_id: str
    school_code: str
    academic_year: str
    slots: List[TimetableSlot]
    effective_from: date
    effective_until: Optional[date] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class CreateTimetableRequest(BaseModel):
    class_id: str
    academic_year: str
    slots: List[TimetableSlot]
    effective_from: date
    effective_until: Optional[date] = None


# ============== COMMUNICATION MODELS ==============

class MessageModel(BaseModel):
    """Direct message between users"""
    model_config = ConfigDict(populate_by_name=True)
    
    id: Optional[str] = None
    sender_id: str
    receiver_id: str
    school_code: str
    subject: str
    content: str
    attachments: List[str] = []
    is_read: bool = False
    parent_message_id: Optional[str] = None  # For threading
    sent_at: datetime
    read_at: Optional[datetime] = None


class SendMessageRequest(BaseModel):
    receiver_id: str
    subject: str
    content: str
    attachments: List[str] = []
    parent_message_id: Optional[str] = None


# ============== EXAM MODELS ==============

class ExamModel(BaseModel):
    """Exam/Test data model"""
    model_config = ConfigDict(populate_by_name=True)
    
    id: Optional[str] = None
    course_id: str
    school_code: str
    exam_name: str
    exam_type: str = Field(..., description="UNIT_TEST, MIDTERM, FINAL, QUIZ")
    description: Optional[str] = None
    exam_date: datetime
    duration_minutes: int
    total_marks: int
    passing_marks: int
    syllabus_coverage: Optional[str] = None
    instructions: Optional[str] = None
    room_number: Optional[str] = None
    created_by: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class CreateExamRequest(BaseModel):
    course_id: str
    exam_name: str
    exam_type: str
    exam_date: datetime
    duration_minutes: int
    total_marks: int
    passing_marks: int
    description: Optional[str] = None
    syllabus_coverage: Optional[str] = None
    instructions: Optional[str] = None
    room_number: Optional[str] = None


class ExamResultModel(BaseModel):
    """Exam result for a student"""
    model_config = ConfigDict(populate_by_name=True)
    
    id: Optional[str] = None
    exam_id: str
    student_id: str
    marks_obtained: float
    total_marks: int
    percentage: float
    grade: str
    rank: Optional[int] = None
    remarks: Optional[str] = None
    graded_by: str
    created_at: Optional[datetime] = None
