export const CONSTANT_MSG = {
    AUTH  : "Auth",
    CALENDER :  'Calender',
    CHAT : 'Chat',
    SERVICE_INACTIVE_MSG : 'service is offline. Please check once',
    SERVICE_ACTIVE_MSG : 'service is online',
    INVALID_CREDENTIALS: 'Invalid Credentails',
    DB_ERROR: 'Error in Database Query',
    CONTENT_NOT_AVAILABLE: 'Content Not Available',
    INVALID_MOBILE_NO: 'Invalid mobile Number',
    UPDATE_FAILED: "Updation Failed",
    UPDATE_OK:"Updated Successfully",
    APPOINT_CANCELED: 'Appointment Cancelled Successfully',
    DAY_OF_WEEK:'Please enter DayOfWeek Correctly',
    ALREADY_PRESENT:'Phone number already exists please login using the existing credentials',
    INVALID_REQUEST:'Invalid request',
    PHONE_EXISTS:"Phone number already exists",
    TIME_OVERLAP:'Time Overlapping with previous Time Interval',
    APPOINT_ALREADY_CANCELLED:'Appointment already Cancelled',
    CONFIRMATION_REQUIRED:'Confirmation Required',
    NO_PERMISSION:'No Permission',
    INVALID_PHONE:'Invalid Phone',
    INVALID_PASSWORD:'Invalid Password',
    END_TIME_MISMATCHING:'End time is mismatching with respect to doctor session timing',
    INVALID_TIMINGS:'Start time should be less than End time',
    NO_WORK_SCHEDULE:'Doctor has no work schedule on this date',
    MAIL_OK:'Mail sent successfully',
    MAIL_ERROR : 'Failure to send mail',
    SMS_OK:'SMS sent successfully',
    SMS_ERROR : 'Failure to send SMS',
    PAYMENT_OK:'SMS sent successfully',
    PAYMENT_ERROR : 'Failure to send SMS',
    CANCEL_EXCEEDS : 'Cancellation is not possible; posting date exceeds limit of days for cancellation',
    RESCHED_EXCEEDS : 'Reschedule is not possible; posting date exceeds limit of days for Reschedule',
    APPOINT_ALREADY_PRESENT:'Appointment already present on this date',
    CANCEL_NOT_ALLOWED:'Patient is not allowed to cancel this appointment',
    RESCHED_NOT_ALLOWED:'Patient is not allowed to reschedule this appointment',
    SIGNATURE_NOT_MATCHED:'Signature not matched',
    SIGNATURE_VERIFIED:'Signature verified',
    NO_APPOINT_PRESENT:'No Appointment present on this date',
    DOC_REG_FAIL :'Failed to register doctor',
    ACC_NOT_FOUND: 'Unable to find hospital, Please contact admin',
    DOC_REG_HOS_RES : 'Other hospital Doctor cannot register in your hospital',
    NO_PRESCRIPTION: 'Please add prescription',
    NO_APPOINTMENT: 'Please select appointment',
    FAILED_UPDATE_APPO: 'Unable update appointment',
    SUCCESS_UPDATE_APPO: 'Appointment updated successfully',
    PASSWORD_UPDATION_SUCCESS: 'Password updated Successfully',
    PASSWORD_UPDATION_FAILED: 'Password Updation Failed',
    OTP_VERIFICATION_SUCCESS: 'OTP Verification Succesfully',
    OTP_VERIFICATION_FAILED: 'OTP Verification Failed',
    NO_MESSAGE_TEMPLATE: 'No Message Template',
    MESSAGE_TEMPLATE_FETCH_SUCCESS: 'Message Template Fetched Successfully',
    ROLES:{
        DOCTOR:'DOCTOR',
        ADMIN:'ADMIN',
        DOC_ASSISTANT:'DOC_ASSISTANT',
        PATIENT:'PATIENT'
    },
    LIVE_STATUS: {
        OFFLINE : "offline",
        ONLINE : "online",
        VIDEO_SESSION_READY : "videoSessionReady",
        IN_SESSION : "inSession"
    },
    APPOINTMENT_STATUS : {
        COMPLETED : "completed",
        PAUSED : "paused",
        NOT_COMPLETED : "notCompleted"
    },
    PAYMENT_STATUS : {
        NOT_PAID : "notPaid",
        PARTIALLY_PAID : "partiallyPaid",
        FULLY_PAID : "fullyPaid",
        REFUNDED :"refunded"
    },
    USER_NOT_FOUND : 'No user registered with this email',
    PASSWORD_CHANGED : 'Successfully updated password',
    PASSCODE_NOT_MATCHED:'Passcode not matched',
    MAIL: {
        FORGOT_PASSWORD: 'FORGOT_PASSWORD',
        RESET_PASSWORD: 'RESET_PASSWORD',
        PATIENT_REGISTRATION: 'PATIENT_REGISTRATION',
        REGISTRATION_FOR_DOCTOR: 'REGISTRATION_FOR_DOCTOR',
        REGISTRATION_FOR_SUB_DOCTOR: 'REGISTRATION_FOR_SUB_DOCTOR',
        APPOINTMENT_CREATED:'APPOINTMENT_CREATED',
        APPOINTMENT_RESCHEDULE:'APPOINTMENT_RESCHEDULE',
        APPOINTMENT_CANCEL:'APPOINTMENT_CANCEL',
    },
    COMM_TYPE: {
        EMAIL: 'Email',
        SMS: 'SMS',
        ON_SCREEN: 'ON_SCREEN'
    }

}