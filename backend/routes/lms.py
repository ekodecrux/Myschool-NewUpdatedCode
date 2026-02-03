"""
LMS (Learning Management System) Routes
Comprehensive API endpoints for all LMS functionality
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from typing import List, Optional
from datetime import datetime, date, timedelta
from ..models.lms_schemas import *
from ..models.user_role import UserRole
from ..utils.auth import get_current_user
from ..database import get_database
import secrets
import string
from bson import ObjectId
import motor.motor_asyncio

router = APIRouter(prefix="/lms", tags=["LMS"])


# ============== HELPER FUNCTIONS ==============

def generate_password(length=12):
    """Generate secure random password"""
    characters = string.ascii_letters + string.digits + string.punctuation
    password = ''.join(secrets.choice(characters) for _ in range(length))
    # Ensure at least one uppercase, lowercase, digit, and special char
    if (any(c.isupper() for c in password) and 
        any(c.islower() for c in password) and 
        any(c.isdigit() for c in password) and
        any(c in string.punctuation for c in password)):
        return password
    return generate_password(length)  # Regenerate if doesn't meet criteria


def calculate_letter_grade(percentage: float) -> str:
    """Calculate letter grade from percentage"""
    if percentage >= 90:
        return "A+"
    elif percentage >= 80:
        return "A"
    elif percentage >= 70:
        return "B"
    elif percentage >= 60:
        return "C"
    elif percentage >= 50:
        return "D"
    else:
        return "F"


def check_permission(current_user, required_roles: List[str]):
    """Check if user has required role"""
    if current_user["role"] not in required_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this resource"
        )


# ============== CLASS MANAGEMENT ==============

@router.post("/classes", response_model=dict)
async def create_class(
    request: CreateClassRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Create a new class (School Admin only)"""
    check_permission(current_user, [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN])
    
    school_code = current_user.get("school_code")
    if not school_code:
        raise HTTPException(status_code=400, detail="School code not found")
    
    # Check if class already exists
    existing = await db.classes.find_one({
        "school_code": school_code,
        "class_name": request.class_name,
        "section": request.section,
        "academic_year": request.academic_year
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Class already exists")
    
    class_data = {
        "school_code": school_code,
        "class_name": request.class_name,
        "section": request.section,
        "academic_year": request.academic_year,
        "class_teacher_id": request.class_teacher_id,
        "room_number": request.room_number,
        "max_students": request.max_students,
        "student_ids": [],
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.classes.insert_one(class_data)
    class_data["id"] = str(result.inserted_id)
    
    return {"message": "Class created successfully", "class_id": str(result.inserted_id), "data": class_data}


@router.get("/classes", response_model=dict)
async def list_classes(
    academic_year: Optional[str] = None,
    is_active: Optional[bool] = True,
    page: int = 1,
    limit: int = 20,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """List all classes for a school"""
    school_code = current_user.get("school_code")
    if not school_code:
        raise HTTPException(status_code=400, detail="School code not found")
    
    query = {"school_code": school_code}
    if academic_year:
        query["academic_year"] = academic_year
    if is_active is not None:
        query["is_active"] = is_active
    
    skip = (page - 1) * limit
    classes_cursor = db.classes.find(query).skip(skip).limit(limit)
    classes = await classes_cursor.to_list(length=limit)
    
    total = await db.classes.count_documents(query)
    
    for cls in classes:
        cls["id"] = str(cls["_id"])
        del cls["_id"]
    
    return {
        "classes": classes,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }


@router.get("/classes/{class_id}", response_model=dict)
async def get_class_details(
    class_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get class details with student and teacher information"""
    class_data = await db.classes.find_one({"_id": ObjectId(class_id)})
    
    if not class_data:
        raise HTTPException(status_code=404, detail="Class not found")
    
    # Get students
    students = []
    if class_data.get("student_ids"):
        students_cursor = db.users.find({"_id": {"$in": [ObjectId(sid) for sid in class_data["student_ids"]]}})
        students = await students_cursor.to_list(length=None)
        for student in students:
            student["id"] = str(student["_id"])
            del student["_id"]
            if "password" in student:
                del student["password"]
    
    # Get teacher
    teacher = None
    if class_data.get("class_teacher_id"):
        teacher = await db.users.find_one({"_id": ObjectId(class_data["class_teacher_id"])})
        if teacher:
            teacher["id"] = str(teacher["_id"])
            del teacher["_id"]
            if "password" in teacher:
                del teacher["password"]
    
    class_data["id"] = str(class_data["_id"])
    del class_data["_id"]
    class_data["students"] = students
    class_data["teacher"] = teacher
    
    return class_data


@router.patch("/classes/{class_id}", response_model=dict)
async def update_class(
    class_id: str,
    request: UpdateClassRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Update class information"""
    check_permission(current_user, [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN])
    
    class_data = await db.classes.find_one({"_id": ObjectId(class_id)})
    if not class_data:
        raise HTTPException(status_code=404, detail="Class not found")
    
    update_data = {k: v for k, v in request.dict(exclude_unset=True).items()}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.classes.update_one({"_id": ObjectId(class_id)}, {"$set": update_data})
    
    return {"message": "Class updated successfully"}


@router.delete("/classes/{class_id}", response_model=dict)
async def delete_class(
    class_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Delete a class (soft delete by marking inactive)"""
    check_permission(current_user, [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN])
    
    await db.classes.update_one(
        {"_id": ObjectId(class_id)},
        {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
    )
    
    return {"message": "Class deleted successfully"}


# ============== COURSE MANAGEMENT ==============

@router.post("/courses", response_model=dict)
async def create_course(
    request: CreateCourseRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Create a new course (Teacher or Admin)"""
    check_permission(current_user, [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER])
    
    school_code = current_user.get("school_code")
    
    # Check if course code already exists
    existing = await db.courses.find_one({
        "school_code": school_code,
        "course_code": request.course_code,
        "academic_year": request.academic_year
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Course code already exists")
    
    course_data = {
        "school_code": school_code,
        "course_name": request.course_name,
        "course_code": request.course_code,
        "description": request.description,
        "class_id": request.class_id,
        "teacher_id": str(current_user["_id"]),
        "academic_year": request.academic_year,
        "subject": request.subject,
        "credits": request.credits,
        "start_date": request.start_date,
        "end_date": request.end_date,
        "status": CourseStatus.DRAFT,
        "enrolled_students": [],
        "tags": request.tags,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.courses.insert_one(course_data)
    
    return {"message": "Course created successfully", "course_id": str(result.inserted_id)}


@router.get("/courses", response_model=dict)
async def list_courses(
    class_id: Optional[str] = None,
    teacher_id: Optional[str] = None,
    academic_year: Optional[str] = None,
    status: Optional[CourseStatus] = None,
    page: int = 1,
    limit: int = 20,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """List courses with filters"""
    school_code = current_user.get("school_code")
    
    query = {"school_code": school_code}
    if class_id:
        query["class_id"] = class_id
    if teacher_id:
        query["teacher_id"] = teacher_id
    if academic_year:
        query["academic_year"] = academic_year
    if status:
        query["status"] = status
    
    # Students can only see published courses they're enrolled in
    if current_user["role"] == UserRole.STUDENT:
        query["status"] = CourseStatus.PUBLISHED
        query["enrolled_students"] = str(current_user["_id"])
    
    skip = (page - 1) * limit
    courses_cursor = db.courses.find(query).skip(skip).limit(limit)
    courses = await courses_cursor.to_list(length=limit)
    
    total = await db.courses.count_documents(query)
    
    for course in courses:
        course["id"] = str(course["_id"])
        del course["_id"]
    
    return {
        "courses": courses,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }


@router.get("/courses/{course_id}", response_model=dict)
async def get_course_details(
    course_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get detailed course information"""
    course = await db.courses.find_one({"_id": ObjectId(course_id)})
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    course["id"] = str(course["_id"])
    del course["_id"]
    
    return course


@router.patch("/courses/{course_id}", response_model=dict)
async def update_course(
    course_id: str,
    request: UpdateCourseRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Update course information"""
    course = await db.courses.find_one({"_id": ObjectId(course_id)})
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check permission
    if current_user["role"] not in [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN]:
        if course["teacher_id"] != str(current_user["_id"]):
            raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = {k: v for k, v in request.dict(exclude_unset=True).items()}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.courses.update_one({"_id": ObjectId(course_id)}, {"$set": update_data})
    
    return {"message": "Course updated successfully"}


@router.post("/courses/enroll", response_model=dict)
async def enroll_students(
    request: EnrollStudentRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Enroll students in a course"""
    check_permission(current_user, [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER])
    
    course = await db.courses.find_one({"_id": ObjectId(request.course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    await db.courses.update_one(
        {"_id": ObjectId(request.course_id)},
        {"$addToSet": {"enrolled_students": {"$each": request.student_ids}}}
    )
    
    return {"message": f"Successfully enrolled {len(request.student_ids)} students"}


# ============== ASSIGNMENT MANAGEMENT ==============

@router.post("/assignments", response_model=dict)
async def create_assignment(
    request: CreateAssignmentRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Create a new assignment (Teacher only)"""
    check_permission(current_user, [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER])
    
    course = await db.courses.find_one({"_id": ObjectId(request.course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    assignment_data = {
        "course_id": request.course_id,
        "teacher_id": str(current_user["_id"]),
        "school_code": current_user["school_code"],
        "title": request.title,
        "description": request.description,
        "instructions": request.instructions,
        "due_date": request.due_date,
        "total_points": request.total_points,
        "assignment_type": request.assignment_type,
        "attachments": request.attachments,
        "status": AssignmentStatus.DRAFT,
        "allow_late_submission": request.allow_late_submission,
        "late_penalty_percent": request.late_penalty_percent,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.assignments.insert_one(assignment_data)
    
    # Create notifications for enrolled students when published
    if assignment_data["status"] == AssignmentStatus.PUBLISHED:
        for student_id in course.get("enrolled_students", []):
            await db.notifications.insert_one({
                "user_id": student_id,
                "school_code": current_user["school_code"],
                "type": NotificationType.ASSIGNMENT,
                "title": f"New Assignment: {request.title}",
                "message": f"New assignment posted in {course['course_name']}",
                "link": f"/lms/assignments/{str(result.inserted_id)}",
                "related_id": str(result.inserted_id),
                "is_read": False,
                "is_email_sent": False,
                "priority": "NORMAL",
                "created_at": datetime.utcnow()
            })
    
    return {"message": "Assignment created successfully", "assignment_id": str(result.inserted_id)}


@router.get("/assignments", response_model=dict)
async def list_assignments(
    course_id: Optional[str] = None,
    status: Optional[AssignmentStatus] = None,
    page: int = 1,
    limit: int = 20,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """List assignments"""
    query = {"school_code": current_user["school_code"]}
    
    if course_id:
        query["course_id"] = course_id
    if status:
        query["status"] = status
    
    # Teachers see their assignments
    if current_user["role"] == UserRole.TEACHER:
        query["teacher_id"] = str(current_user["_id"])
    
    # Students see assignments from their enrolled courses
    elif current_user["role"] == UserRole.STUDENT:
        enrolled_courses = await db.courses.find({
            "enrolled_students": str(current_user["_id"])
        }).to_list(length=None)
        course_ids = [str(c["_id"]) for c in enrolled_courses]
        query["course_id"] = {"$in": course_ids}
        query["status"] = AssignmentStatus.PUBLISHED
    
    skip = (page - 1) * limit
    assignments_cursor = db.assignments.find(query).skip(skip).limit(limit).sort("due_date", 1)
    assignments = await assignments_cursor.to_list(length=limit)
    
    total = await db.assignments.count_documents(query)
    
    for assignment in assignments:
        assignment["id"] = str(assignment["_id"])
        del assignment["_id"]
    
    return {
        "assignments": assignments,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }


@router.get("/assignments/{assignment_id}", response_model=dict)
async def get_assignment_details(
    assignment_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get assignment details"""
    assignment = await db.assignments.find_one({"_id": ObjectId(assignment_id)})
    
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    assignment["id"] = str(assignment["_id"])
    del assignment["_id"]
    
    # For students, also get their submission status
    if current_user["role"] == UserRole.STUDENT:
        submission = await db.submissions.find_one({
            "assignment_id": assignment_id,
            "student_id": str(current_user["_id"])
        })
        assignment["submission_status"] = submission.get("status") if submission else SubmissionStatus.NOT_SUBMITTED
        if submission:
            submission["id"] = str(submission["_id"])
            del submission["_id"]
            assignment["my_submission"] = submission
    
    return assignment


@router.patch("/assignments/{assignment_id}", response_model=dict)
async def update_assignment(
    assignment_id: str,
    request: UpdateAssignmentRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Update assignment"""
    assignment = await db.assignments.find_one({"_id": ObjectId(assignment_id)})
    
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    # Check permission
    if current_user["role"] not in [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN]:
        if assignment["teacher_id"] != str(current_user["_id"]):
            raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = {k: v for k, v in request.dict(exclude_unset=True).items()}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.assignments.update_one({"_id": ObjectId(assignment_id)}, {"$set": update_data})
    
    return {"message": "Assignment updated successfully"}


# ============== SUBMISSION MANAGEMENT ==============

@router.post("/submissions", response_model=dict)
async def submit_assignment(
    request: CreateSubmissionRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Submit an assignment (Student only)"""
    check_permission(current_user, [UserRole.STUDENT])
    
    assignment = await db.assignments.find_one({"_id": ObjectId(request.assignment_id)})
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    # Check if already submitted
    existing = await db.submissions.find_one({
        "assignment_id": request.assignment_id,
        "student_id": str(current_user["_id"])
    })
    
    is_late = datetime.utcnow() > assignment["due_date"]
    
    if existing:
        # Update existing submission
        await db.submissions.update_one(
            {"_id": existing["_id"]},
            {
                "$set": {
                    "submission_text": request.submission_text,
                    "attachments": request.attachments,
                    "submitted_at": datetime.utcnow(),
                    "status": SubmissionStatus.LATE if is_late else SubmissionStatus.SUBMITTED,
                    "is_late": is_late,
                    "updated_at": datetime.utcnow()
                },
                "$inc": {"attempt_number": 1}
            }
        )
        submission_id = str(existing["_id"])
    else:
        # Create new submission
        submission_data = {
            "assignment_id": request.assignment_id,
            "student_id": str(current_user["_id"]),
            "course_id": assignment["course_id"],
            "submission_text": request.submission_text,
            "attachments": request.attachments,
            "submitted_at": datetime.utcnow(),
            "status": SubmissionStatus.LATE if is_late else SubmissionStatus.SUBMITTED,
            "is_late": is_late,
            "attempt_number": 1,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await db.submissions.insert_one(submission_data)
        submission_id = str(result.inserted_id)
    
    return {"message": "Assignment submitted successfully", "submission_id": submission_id}


@router.post("/submissions/grade", response_model=dict)
async def grade_submission(
    request: GradeSubmissionRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Grade a student submission (Teacher only)"""
    check_permission(current_user, [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER])
    
    submission = await db.submissions.find_one({"_id": ObjectId(request.submission_id)})
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    assignment = await db.assignments.find_one({"_id": ObjectId(submission["assignment_id"])})
    
    # Update submission
    await db.submissions.update_one(
        {"_id": ObjectId(request.submission_id)},
        {
            "$set": {
                "score": request.score,
                "max_score": assignment["total_points"],
                "feedback": request.feedback,
                "graded_by": str(current_user["_id"]),
                "graded_at": datetime.utcnow(),
                "status": SubmissionStatus.GRADED,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Create grade record
    percentage = (request.score / assignment["total_points"]) * 100
    letter_grade = calculate_letter_grade(percentage)
    
    grade_data = {
        "student_id": submission["student_id"],
        "course_id": submission["course_id"],
        "school_code": current_user["school_code"],
        "assignment_id": submission["assignment_id"],
        "grade_type": assignment["assignment_type"],
        "score": request.score,
        "max_score": assignment["total_points"],
        "percentage": percentage,
        "letter_grade": letter_grade,
        "comments": request.feedback,
        "graded_by": str(current_user["_id"]),
        "graded_at": datetime.utcnow(),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    await db.grades.insert_one(grade_data)
    
    # Notify student
    await db.notifications.insert_one({
        "user_id": submission["student_id"],
        "school_code": current_user["school_code"],
        "type": NotificationType.GRADE,
        "title": "Assignment Graded",
        "message": f"Your assignment has been graded: {request.score}/{assignment['total_points']}",
        "link": f"/lms/assignments/{submission['assignment_id']}",
        "related_id": request.submission_id,
        "is_read": False,
        "is_email_sent": False,
        "priority": "NORMAL",
        "created_at": datetime.utcnow()
    })
    
    return {"message": "Submission graded successfully"}


@router.get("/submissions/assignment/{assignment_id}", response_model=dict)
async def get_assignment_submissions(
    assignment_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get all submissions for an assignment (Teacher only)"""
    check_permission(current_user, [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER])
    
    submissions_cursor = db.submissions.find({"assignment_id": assignment_id})
    submissions = await submissions_cursor.to_list(length=None)
    
    for submission in submissions:
        submission["id"] = str(submission["_id"])
        del submission["_id"]
        
        # Get student details
        student = await db.users.find_one({"_id": ObjectId(submission["student_id"])})
        if student:
            submission["student_name"] = student.get("name")
            submission["student_email"] = student.get("email")
    
    return {"submissions": submissions, "total": len(submissions)}


# ============== ATTENDANCE MANAGEMENT ==============

@router.post("/attendance/mark", response_model=dict)
async def mark_attendance(
    request: MarkAttendanceRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Mark attendance for a class (Teacher or Admin only)"""
    check_permission(current_user, [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER])
    
    school_code = current_user["school_code"]
    
    # Prepare attendance records
    attendance_records = []
    for record in request.attendance_records:
        attendance_data = {
            "student_id": record["student_id"],
            "class_id": request.class_id,
            "course_id": request.course_id,
            "school_code": school_code,
            "date": request.date,
            "status": record["status"],
            "marked_by": str(current_user["_id"]),
            "remarks": record.get("remarks"),
            "check_in_time": datetime.utcnow(),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        attendance_records.append(attendance_data)
    
    # Insert or update attendance records
    for record in attendance_records:
        await db.attendance.update_one(
            {
                "student_id": record["student_id"],
                "class_id": request.class_id,
                "date": request.date
            },
            {"$set": record},
            upsert=True
        )
    
    # Notify parents of absent students
    for record in attendance_records:
        if record["status"] in [AttendanceStatus.ABSENT, AttendanceStatus.LATE]:
            # Find parent links
            parent_links = await db.parent_student_links.find({"student_id": record["student_id"]}).to_list(length=None)
            for link in parent_links:
                await db.notifications.insert_one({
                    "user_id": link["parent_id"],
                    "school_code": school_code,
                    "type": NotificationType.ATTENDANCE,
                    "title": "Attendance Alert",
                    "message": f"Your child was marked {record['status']} on {request.date}",
                    "link": f"/lms/attendance/student/{record['student_id']}",
                    "related_id": record["student_id"],
                    "is_read": False,
                    "is_email_sent": False,
                    "priority": "HIGH",
                    "created_at": datetime.utcnow()
                })
    
    return {"message": f"Attendance marked for {len(attendance_records)} students"}


@router.get("/attendance/class/{class_id}", response_model=dict)
async def get_class_attendance(
    class_id: str,
    date: Optional[date] = Query(default=None),
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get attendance for a class"""
    query = {"class_id": class_id}
    
    if date:
        query["date"] = date
    elif start_date and end_date:
        query["date"] = {"$gte": start_date, "$lte": end_date}
    
    attendance_cursor = db.attendance.find(query).sort("date", -1)
    records = await attendance_cursor.to_list(length=None)
    
    for record in records:
        record["id"] = str(record["_id"])
        del record["_id"]
    
    return {"attendance": records, "total": len(records)}


@router.get("/attendance/student/{student_id}/report", response_model=AttendanceReport)
async def get_student_attendance_report(
    student_id: str,
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get attendance report for a student"""
    # Permission check
    if current_user["role"] == UserRole.STUDENT:
        if str(current_user["_id"]) != student_id:
            raise HTTPException(status_code=403, detail="Not authorized")
    elif current_user["role"] == UserRole.PARENT:
        link = await db.parent_student_links.find_one({
            "parent_id": str(current_user["_id"]),
            "student_id": student_id
        })
        if not link:
            raise HTTPException(status_code=403, detail="Not authorized")
    
    query = {"student_id": student_id}
    if start_date and end_date:
        query["date"] = {"$gte": start_date, "$lte": end_date}
    
    records = await db.attendance.find(query).to_list(length=None)
    
    total_days = len(records)
    present_days = sum(1 for r in records if r["status"] == AttendanceStatus.PRESENT)
    absent_days = sum(1 for r in records if r["status"] == AttendanceStatus.ABSENT)
    late_days = sum(1 for r in records if r["status"] == AttendanceStatus.LATE)
    excused_days = sum(1 for r in records if r["status"] == AttendanceStatus.EXCUSED)
    
    attendance_percentage = (present_days / total_days * 100) if total_days > 0 else 0
    
    recent_absences = [r["date"] for r in records if r["status"] == AttendanceStatus.ABSENT][:10]
    
    student = await db.users.find_one({"_id": ObjectId(student_id)})
    student_name = student.get("name", "Unknown") if student else "Unknown"
    
    return AttendanceReport(
        student_id=student_id,
        student_name=student_name,
        class_id=records[0]["class_id"] if records else "",
        total_days=total_days,
        present_days=present_days,
        absent_days=absent_days,
        late_days=late_days,
        excused_days=excused_days,
        attendance_percentage=attendance_percentage,
        recent_absences=recent_absences
    )


# ============== GRADES & REPORTS ==============

@router.get("/grades/student/{student_id}", response_model=dict)
async def get_student_grades(
    student_id: str,
    course_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get grades for a student"""
    # Permission check
    if current_user["role"] == UserRole.STUDENT:
        if str(current_user["_id"]) != student_id:
            raise HTTPException(status_code=403, detail="Not authorized")
    elif current_user["role"] == UserRole.PARENT:
        link = await db.parent_student_links.find_one({
            "parent_id": str(current_user["_id"]),
            "student_id": student_id
        })
        if not link:
            raise HTTPException(status_code=403, detail="Not authorized")
    
    query = {"student_id": student_id}
    if course_id:
        query["course_id"] = course_id
    
    grades_cursor = db.grades.find(query).sort("graded_at", -1)
    grades = await grades_cursor.to_list(length=None)
    
    for grade in grades:
        grade["id"] = str(grade["_id"])
        del grade["_id"]
    
    return {"grades": grades, "total": len(grades)}


@router.get("/grades/course/{course_id}/report", response_model=dict)
async def get_course_grade_report(
    course_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get grade report for all students in a course (Teacher only)"""
    check_permission(current_user, [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER])
    
    course = await db.courses.find_one({"_id": ObjectId(course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    reports = []
    for student_id in course.get("enrolled_students", []):
        student = await db.users.find_one({"_id": ObjectId(student_id)})
        if not student:
            continue
        
        grades = await db.grades.find({"student_id": student_id, "course_id": course_id}).to_list(length=None)
        
        total_score = sum(g["score"] for g in grades)
        max_possible = sum(g["max_score"] for g in grades)
        overall_percentage = (total_score / max_possible * 100) if max_possible > 0 else 0
        
        for grade in grades:
            grade["id"] = str(grade["_id"])
            del grade["_id"]
        
        reports.append(GradeReport(
            student_id=student_id,
            student_name=student.get("name", "Unknown"),
            course_id=course_id,
            course_name=course["course_name"],
            grades=grades,
            total_score=total_score,
            max_possible_score=max_possible,
            overall_percentage=overall_percentage,
            letter_grade=calculate_letter_grade(overall_percentage)
        ))
    
    return {"reports": reports, "total": len(reports)}


# ============== ANNOUNCEMENTS ==============

@router.post("/announcements", response_model=dict)
async def create_announcement(
    request: CreateAnnouncementRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Create an announcement"""
    check_permission(current_user, [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER])
    
    announcement_data = {
        "school_code": current_user["school_code"],
        "title": request.title,
        "content": request.content,
        "author_id": str(current_user["_id"]),
        "author_role": current_user["role"],
        "target_roles": request.target_roles,
        "target_classes": request.target_classes,
        "priority": request.priority,
        "attachments": request.attachments,
        "is_pinned": request.is_pinned,
        "published_at": datetime.utcnow(),
        "expires_at": request.expires_at,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.announcements.insert_one(announcement_data)
    
    # Create notifications for target users
    query = {"school_code": current_user["school_code"]}
    if request.target_roles:
        query["role"] = {"$in": request.target_roles}
    
    target_users = await db.users.find(query).to_list(length=None)
    
    for user in target_users:
        await db.notifications.insert_one({
            "user_id": str(user["_id"]),
            "school_code": current_user["school_code"],
            "type": NotificationType.ANNOUNCEMENT,
            "title": f"New Announcement: {request.title}",
            "message": request.content[:200],
            "link": f"/lms/announcements/{str(result.inserted_id)}",
            "related_id": str(result.inserted_id),
            "is_read": False,
            "is_email_sent": False,
            "priority": request.priority,
            "created_at": datetime.utcnow()
        })
    
    return {"message": "Announcement created successfully", "announcement_id": str(result.inserted_id)}


@router.get("/announcements", response_model=dict)
async def list_announcements(
    page: int = 1,
    limit: int = 20,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """List announcements for current user"""
    query = {
        "school_code": current_user["school_code"],
        "$or": [
            {"target_roles": current_user["role"]},
            {"target_roles": {"$size": 0}}
        ]
    }
    
    skip = (page - 1) * limit
    announcements_cursor = db.announcements.find(query).skip(skip).limit(limit).sort([("is_pinned", -1), ("published_at", -1)])
    announcements = await announcements_cursor.to_list(length=limit)
    
    total = await db.announcements.count_documents(query)
    
    for announcement in announcements:
        announcement["id"] = str(announcement["_id"])
        del announcement["_id"]
    
    return {
        "announcements": announcements,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }


# ============== NOTIFICATIONS ==============

@router.get("/notifications", response_model=dict)
async def get_notifications(
    is_read: Optional[bool] = None,
    page: int = 1,
    limit: int = 50,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get notifications for current user"""
    query = {"user_id": str(current_user["_id"])}
    if is_read is not None:
        query["is_read"] = is_read
    
    skip = (page - 1) * limit
    notifications_cursor = db.notifications.find(query).skip(skip).limit(limit).sort("created_at", -1)
    notifications = await notifications_cursor.to_list(length=limit)
    
    total = await db.notifications.count_documents(query)
    unread = await db.notifications.count_documents({"user_id": str(current_user["_id"]), "is_read": False})
    
    for notification in notifications:
        notification["id"] = str(notification["_id"])
        del notification["_id"]
    
    return {
        "notifications": notifications,
        "total": total,
        "unread": unread,
        "page": page,
        "pages": (total + limit - 1) // limit
    }


@router.patch("/notifications/{notification_id}/read", response_model=dict)
async def mark_notification_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Mark notification as read"""
    await db.notifications.update_one(
        {"_id": ObjectId(notification_id), "user_id": str(current_user["_id"])},
        {"$set": {"is_read": True}}
    )
    
    return {"message": "Notification marked as read"}


@router.post("/notifications/mark-all-read", response_model=dict)
async def mark_all_notifications_read(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Mark all notifications as read"""
    await db.notifications.update_many(
        {"user_id": str(current_user["_id"]), "is_read": False},
        {"$set": {"is_read": True}}
    )
    
    return {"message": "All notifications marked as read"}


# ============== ANALYTICS & REPORTS ==============

@router.get("/analytics/student/{student_id}", response_model=StudentAnalytics)
async def get_student_analytics(
    student_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get comprehensive analytics for a student"""
    # Permission check
    if current_user["role"] == UserRole.STUDENT:
        if str(current_user["_id"]) != student_id:
            raise HTTPException(status_code=403, detail="Not authorized")
    elif current_user["role"] == UserRole.PARENT:
        link = await db.parent_student_links.find_one({
            "parent_id": str(current_user["_id"]),
            "student_id": student_id
        })
        if not link:
            raise HTTPException(status_code=403, detail="Not authorized")
    
    student = await db.users.find_one({"_id": ObjectId(student_id)})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Get grades
    grades = await db.grades.find({"student_id": student_id}).to_list(length=None)
    total_score = sum(g["score"] for g in grades)
    max_score = sum(g["max_score"] for g in grades)
    average_score = (total_score / max_score * 100) if max_score > 0 else 0
    
    # Calculate GPA (assuming 4.0 scale)
    gpa = average_score / 25 if average_score > 0 else 0
    
    # Get enrolled courses
    courses = await db.courses.find({"enrolled_students": student_id}).to_list(length=None)
    total_courses = len(courses)
    
    # Get attendance
    attendance_records = await db.attendance.find({"student_id": student_id}).to_list(length=None)
    present_count = sum(1 for r in attendance_records if r["status"] == AttendanceStatus.PRESENT)
    attendance_percentage = (present_count / len(attendance_records) * 100) if attendance_records else 0
    
    # Get assignments
    submissions = await db.submissions.find({"student_id": student_id}).to_list(length=None)
    completed = sum(1 for s in submissions if s["status"] in [SubmissionStatus.SUBMITTED, SubmissionStatus.GRADED])
    
    # Get pending assignments
    course_ids = [str(c["_id"]) for c in courses]
    all_assignments = await db.assignments.find({
        "course_id": {"$in": course_ids},
        "status": AssignmentStatus.PUBLISHED
    }).to_list(length=None)
    submitted_assignment_ids = [s["assignment_id"] for s in submissions]
    pending = sum(1 for a in all_assignments if str(a["_id"]) not in submitted_assignment_ids)
    
    # Grades by subject
    grades_by_subject = {}
    for grade in grades:
        course = await db.courses.find_one({"_id": ObjectId(grade["course_id"])})
        if course:
            subject = course["subject"]
            if subject not in grades_by_subject:
                grades_by_subject[subject] = []
            grades_by_subject[subject].append(grade["percentage"])
    
    for subject in grades_by_subject:
        grades_by_subject[subject] = sum(grades_by_subject[subject]) / len(grades_by_subject[subject])
    
    return StudentAnalytics(
        student_id=student_id,
        student_name=student.get("name", "Unknown"),
        overall_gpa=gpa,
        total_courses=total_courses,
        attendance_percentage=attendance_percentage,
        assignments_completed=completed,
        assignments_pending=pending,
        average_score=average_score,
        grades_by_subject=grades_by_subject,
        recent_performance_trend="STABLE"
    )


@router.get("/analytics/teacher/{teacher_id}", response_model=TeacherAnalytics)
async def get_teacher_analytics(
    teacher_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get comprehensive analytics for a teacher"""
    # Permission check
    if current_user["role"] == UserRole.TEACHER:
        if str(current_user["_id"]) != teacher_id:
            raise HTTPException(status_code=403, detail="Not authorized")
    elif current_user["role"] not in [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    teacher = await db.users.find_one({"_id": ObjectId(teacher_id)})
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    # Get courses
    courses = await db.courses.find({"teacher_id": teacher_id}).to_list(length=None)
    total_courses = len(courses)
    
    # Get unique students
    all_students = set()
    for course in courses:
        all_students.update(course.get("enrolled_students", []))
    total_students = len(all_students)
    
    # Get assignments
    assignments = await db.assignments.find({"teacher_id": teacher_id}).to_list(length=None)
    total_assignments = len(assignments)
    
    # Get pending grading
    submissions = await db.submissions.find({
        "assignment_id": {"$in": [str(a["_id"]) for a in assignments]},
        "status": SubmissionStatus.SUBMITTED
    }).to_list(length=None)
    pending_grading = len(submissions)
    
    # Calculate average class performance
    all_grades = await db.grades.find({"graded_by": teacher_id}).to_list(length=None)
    avg_performance = sum(g["percentage"] for g in all_grades) / len(all_grades) if all_grades else 0
    
    # Course summaries
    courses_summary = []
    for course in courses:
        course_grades = [g for g in all_grades if g["course_id"] == str(course["_id"])]
        avg_grade = sum(g["percentage"] for g in course_grades) / len(course_grades) if course_grades else 0
        
        courses_summary.append({
            "course_id": str(course["_id"]),
            "course_name": course["course_name"],
            "enrolled_students": len(course.get("enrolled_students", [])),
            "average_grade": avg_grade
        })
    
    return TeacherAnalytics(
        teacher_id=teacher_id,
        teacher_name=teacher.get("name", "Unknown"),
        total_courses=total_courses,
        total_students=total_students,
        total_assignments=total_assignments,
        pending_grading=pending_grading,
        average_class_performance=avg_performance,
        courses_summary=courses_summary
    )


@router.get("/analytics/school", response_model=SchoolAnalytics)
async def get_school_analytics(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get comprehensive analytics for entire school (Admin only)"""
    check_permission(current_user, [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN])
    
    school_code = current_user["school_code"]
    
    # Get school details
    school = await db.schools.find_one({"code": school_code})
    school_name = school.get("name", "Unknown") if school else "Unknown"
    
    # Count students
    total_students = await db.users.count_documents({"school_code": school_code, "role": UserRole.STUDENT})
    
    # Count teachers
    total_teachers = await db.users.count_documents({"school_code": school_code, "role": UserRole.TEACHER})
    
    # Count classes
    total_classes = await db.classes.count_documents({"school_code": school_code, "is_active": True})
    
    # Count courses
    total_courses = await db.courses.count_documents({"school_code": school_code})
    
    # Calculate attendance rate
    attendance_records = await db.attendance.find({"school_code": school_code}).to_list(length=None)
    present_count = sum(1 for r in attendance_records if r["status"] == AttendanceStatus.PRESENT)
    overall_attendance_rate = (present_count / len(attendance_records) * 100) if attendance_records else 0
    
    # Calculate average grade
    all_grades = await db.grades.find({"school_code": school_code}).to_list(length=None)
    overall_average_grade = sum(g["percentage"] for g in all_grades) / len(all_grades) if all_grades else 0
    
    # Top performing classes
    classes = await db.classes.find({"school_code": school_code, "is_active": True}).to_list(length=None)
    top_performing_classes = []
    
    for cls in classes:
        class_students = cls.get("student_ids", [])
        if not class_students:
            continue
        
        class_grades = [g for g in all_grades if g["student_id"] in class_students]
        if class_grades:
            avg_grade = sum(g["percentage"] for g in class_grades) / len(class_grades)
            top_performing_classes.append({
                "class_id": str(cls["_id"]),
                "class_name": f"{cls['class_name']} {cls['section']}",
                "average_grade": avg_grade,
                "total_students": len(class_students)
            })
    
    top_performing_classes.sort(key=lambda x: x["average_grade"], reverse=True)
    top_performing_classes = top_performing_classes[:5]
    
    # Teacher-student ratio
    teacher_student_ratio = total_students / total_teachers if total_teachers > 0 else 0
    
    return SchoolAnalytics(
        school_code=school_code,
        school_name=school_name,
        total_students=total_students,
        total_teachers=total_teachers,
        total_classes=total_classes,
        total_courses=total_courses,
        overall_attendance_rate=overall_attendance_rate,
        overall_average_grade=overall_average_grade,
        top_performing_classes=top_performing_classes,
        teacher_student_ratio=teacher_student_ratio,
        recent_trends={}
    )


# ============== PARENT-STUDENT LINK ==============

@router.post("/parent-student-link", response_model=dict)
async def link_parent_to_students(
    request: LinkParentStudentRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Link parent to students (Admin only)"""
    check_permission(current_user, [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN])
    
    school_code = current_user["school_code"]
    
    # Verify parent exists
    parent = await db.users.find_one({"_id": ObjectId(request.parent_id), "role": UserRole.PARENT})
    if not parent:
        raise HTTPException(status_code=404, detail="Parent not found")
    
    # Create links
    for student_id in request.student_ids:
        # Verify student exists
        student = await db.users.find_one({"_id": ObjectId(student_id), "role": UserRole.STUDENT})
        if not student:
            continue
        
        link_data = {
            "parent_id": request.parent_id,
            "student_id": student_id,
            "school_code": school_code,
            "relationship": request.relationship,
            "is_primary_contact": request.is_primary_contact,
            "can_view_grades": True,
            "can_view_attendance": True,
            "can_communicate_teachers": True,
            "created_at": datetime.utcnow()
        }
        
        await db.parent_student_links.update_one(
            {"parent_id": request.parent_id, "student_id": student_id},
            {"$set": link_data},
            upsert=True
        )
    
    return {"message": f"Successfully linked parent to {len(request.student_ids)} students"}


@router.get("/parent-student-link/parent/{parent_id}", response_model=dict)
async def get_parent_students(
    parent_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get all students linked to a parent"""
    # Permission check
    if current_user["role"] == UserRole.PARENT:
        if str(current_user["_id"]) != parent_id:
            raise HTTPException(status_code=403, detail="Not authorized")
    
    links = await db.parent_student_links.find({"parent_id": parent_id}).to_list(length=None)
    
    students = []
    for link in links:
        student = await db.users.find_one({"_id": ObjectId(link["student_id"])})
        if student:
            student["id"] = str(student["_id"])
            del student["_id"]
            if "password" in student:
                del student["password"]
            student["relationship"] = link["relationship"]
            students.append(student)
    
    return {"students": students, "total": len(students)}


# ============== EVENTS/CALENDAR ==============

@router.post("/events", response_model=dict)
async def create_event(
    request: CreateEventRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Create a calendar event"""
    check_permission(current_user, [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER])
    
    event_data = {
        "school_code": current_user["school_code"],
        "title": request.title,
        "description": request.description,
        "event_type": request.event_type,
        "start_date": request.start_date,
        "end_date": request.end_date,
        "location": request.location,
        "organizer_id": str(current_user["_id"]),
        "target_classes": request.target_classes,
        "target_users": request.target_users,
        "is_all_day": request.is_all_day,
        "reminder_before_minutes": request.reminder_before_minutes,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.events.insert_one(event_data)
    
    # Create reminders for target users
    # This would be handled by a background task in production
    
    return {"message": "Event created successfully", "event_id": str(result.inserted_id)}


@router.get("/events", response_model=dict)
async def list_events(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    event_type: Optional[EventType] = None,
    page: int = 1,
    limit: int = 50,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """List calendar events"""
    query = {"school_code": current_user["school_code"]}
    
    if start_date and end_date:
        query["start_date"] = {"$gte": datetime.combine(start_date, datetime.min.time())}
        query["end_date"] = {"$lte": datetime.combine(end_date, datetime.max.time())}
    
    if event_type:
        query["event_type"] = event_type
    
    skip = (page - 1) * limit
    events_cursor = db.events.find(query).skip(skip).limit(limit).sort("start_date", 1)
    events = await events_cursor.to_list(length=limit)
    
    total = await db.events.count_documents(query)
    
    for event in events:
        event["id"] = str(event["_id"])
        del event["_id"]
    
    return {
        "events": events,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }


# ============== BULK USER CREATION ==============

@router.post("/bulk/create-users", response_model=BulkUserCreateResponse)
async def bulk_create_users(
    users: List[BulkUserCreate],
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Bulk create users with secure passwords (Admin only)"""
    check_permission(current_user, [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN])
    
    school_code = current_user["school_code"]
    created_users = []
    failed_users = []
    passwords = {}
    
    for user_data in users:
        try:
            # Check if user already exists
            existing = await db.users.find_one({"email": user_data.email})
            if existing:
                failed_users.append({
                    "email": user_data.email,
                    "reason": "User already exists"
                })
                continue
            
            # Generate password
            password = generate_password()
            passwords[user_data.email] = password
            
            # Create user
            new_user = {
                "email": user_data.email,
                "name": user_data.name,
                "password": password,  # Should be hashed in production
                "mobile_number": user_data.mobile_number,
                "role": user_data.role,
                "school_code": school_code,
                "disabled": False,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            # Add role-specific fields
            if user_data.role == UserRole.STUDENT:
                new_user.update({
                    "class_name": user_data.class_name,
                    "section_name": user_data.section,
                    "roll_number": user_data.roll_number
                })
            elif user_data.role == UserRole.TEACHER:
                new_user["subject"] = user_data.subject
            
            result = await db.users.insert_one(new_user)
            
            created_users.append({
                "id": str(result.inserted_id),
                "email": user_data.email,
                "name": user_data.name,
                "role": user_data.role
            })
            
            # Send email with password (implement email service)
            # await send_welcome_email(user_data.email, password)
            
        except Exception as e:
            failed_users.append({
                "email": user_data.email,
                "reason": str(e)
            })
    
    return BulkUserCreateResponse(
        success_count=len(created_users),
        failed_count=len(failed_users),
        created_users=created_users,
        failed_users=failed_users,
        passwords=passwords
    )


# ============== TIMETABLE ==============

@router.post("/timetable", response_model=dict)
async def create_timetable(
    request: CreateTimetableRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Create class timetable (Admin only)"""
    check_permission(current_user, [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN])
    
    timetable_data = {
        "class_id": request.class_id,
        "school_code": current_user["school_code"],
        "academic_year": request.academic_year,
        "slots": [slot.dict() for slot in request.slots],
        "effective_from": request.effective_from,
        "effective_until": request.effective_until,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.timetables.insert_one(timetable_data)
    
    return {"message": "Timetable created successfully", "timetable_id": str(result.inserted_id)}


@router.get("/timetable/class/{class_id}", response_model=dict)
async def get_class_timetable(
    class_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get timetable for a class"""
    timetable = await db.timetables.find_one({
        "class_id": class_id,
        "effective_from": {"$lte": date.today()},
        "$or": [
            {"effective_until": {"$gte": date.today()}},
            {"effective_until": None}
        ]
    })
    
    if not timetable:
        raise HTTPException(status_code=404, detail="Timetable not found")
    
    timetable["id"] = str(timetable["_id"])
    del timetable["_id"]
    
    return timetable


# ============== EXAM MANAGEMENT ==============

@router.post("/exams", response_model=dict)
async def create_exam(
    request: CreateExamRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Create an exam (Teacher or Admin)"""
    check_permission(current_user, [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER])
    
    exam_data = {
        "course_id": request.course_id,
        "school_code": current_user["school_code"],
        "exam_name": request.exam_name,
        "exam_type": request.exam_type,
        "description": request.description,
        "exam_date": request.exam_date,
        "duration_minutes": request.duration_minutes,
        "total_marks": request.total_marks,
        "passing_marks": request.passing_marks,
        "syllabus_coverage": request.syllabus_coverage,
        "instructions": request.instructions,
        "room_number": request.room_number,
        "created_by": str(current_user["_id"]),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.exams.insert_one(exam_data)
    
    # Notify students
    course = await db.courses.find_one({"_id": ObjectId(request.course_id)})
    if course:
        for student_id in course.get("enrolled_students", []):
            await db.notifications.insert_one({
                "user_id": student_id,
                "school_code": current_user["school_code"],
                "type": NotificationType.REMINDER,
                "title": f"Exam Scheduled: {request.exam_name}",
                "message": f"Exam scheduled on {request.exam_date.strftime('%Y-%m-%d %H:%M')}",
                "link": f"/lms/exams/{str(result.inserted_id)}",
                "related_id": str(result.inserted_id),
                "is_read": False,
                "is_email_sent": False,
                "priority": "HIGH",
                "created_at": datetime.utcnow()
            })
    
    return {"message": "Exam created successfully", "exam_id": str(result.inserted_id)}


@router.get("/exams/course/{course_id}", response_model=dict)
async def get_course_exams(
    course_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get all exams for a course"""
    exams_cursor = db.exams.find({"course_id": course_id}).sort("exam_date", -1)
    exams = await exams_cursor.to_list(length=None)
    
    for exam in exams:
        exam["id"] = str(exam["_id"])
        del exam["_id"]
    
    return {"exams": exams, "total": len(exams)}
