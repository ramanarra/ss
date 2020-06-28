import {HttpStatus, Injectable} from '@nestjs/common';
import {AppointmentRepository} from './appointment.repository';
import {InjectRepository} from '@nestjs/typeorm';
import {
    AppointmentDto,
    UserDto,
    DoctorConfigPreConsultationDto,
    DoctorConfigCanReschDto,
    DocConfigDto,
    WorkScheduleDto
} from 'common-dto';
import {Appointment} from './appointment.entity';
import {Doctor} from './doctor/doctor.entity';
import {DoctorRepository} from './doctor/doctor.repository';
import {AccountDetailsRepository} from './account/account.repository';
import {AccountDetails} from './account/account_details.entity';
import {DoctorConfigPreConsultationRepository} from './doctorConfigPreConsultancy/doctor_config_preconsultation.repository';
import {DoctorConfigPreConsultation} from './doctorConfigPreConsultancy/doctor_config_preconsultation.entity';
import {DoctorConfigCanReschRepository} from './docConfigReschedule/doc_config_can_resch.repository';
import {DoctorConfigCanResch} from './docConfigReschedule/doc_config_can_resch.entity';
import {docConfigRepository} from "./doc_config/docConfig.repository";
import {queries} from "../config/query";
import {DocConfigScheduleDayRepository} from "./docConfigScheduleDay/docConfigScheduleDay.repository";
import {DocConfigScheduleIntervalRepository} from "./docConfigScheduleInterval/docConfigScheduleInterval.repository";
import {WorkScheduleDayRepository} from "./workSchedule/workScheduleDay.repository";
import {WorkScheduleIntervalRepository} from "./workSchedule/workScheduleInterval.repository";
import {getRepository, Any} from "typeorm";
import {DocConfigScheduleDay} from "./docConfigScheduleDay/docConfigScheduleDay.entity";
import {PatientDetailsRepository} from "./patientDetails/patientDetails.repository";
import {PatientDetails} from './patientDetails/patientDetails.entity';
import {PaymentDetailsRepository} from "./paymentDetails/paymentDetails.repository";
import {Helper} from "../utility/helper";


var async = require('async');


@Injectable()
export class AppointmentService {

    constructor(
        @InjectRepository(AppointmentRepository) private appointmentRepository: AppointmentRepository,
        private accountDetailsRepository: AccountDetailsRepository, private doctorRepository: DoctorRepository,
        private doctorConfigPreConsultationRepository: DoctorConfigPreConsultationRepository,
        private doctorConfigCanReschRepository: DoctorConfigCanReschRepository,
        private doctorConfigRepository: docConfigRepository,
        private docConfigScheduleDayRepository: DocConfigScheduleDayRepository,
        private docConfigScheduleIntervalRepository: DocConfigScheduleIntervalRepository,
        private workScheduleDayRepository: WorkScheduleDayRepository,
        private workScheduleIntervalRepository: WorkScheduleIntervalRepository,
        private patientDetailsRepository: PatientDetailsRepository,
        private paymentDetailsRepository: PaymentDetailsRepository
    ) {
    }

    async getAppointmentList(doctorId): Promise<Appointment[]> {
        return await this.appointmentRepository.find({doctorId: doctorId});
    }

    async createAppointment(appointmentDto: AppointmentDto): Promise<any> {
        return await this.appointmentRepository.createAppointment(appointmentDto);
    }

    async doctorDetails(doctorKey): Promise<any> {
        return await this.doctorRepository.findOne({doctorKey: doctorKey});
    }

    async doctorListDetails(doctorKey): Promise<any> {
        //  return await this.doctorRepository.findOne({doctorKey: doctorKey});
        let docConfig = await this.docConfigScheduleDayRepository.query(queries.getDocDetails, [doctorKey]);
        return docConfig;
    }

    async accountDetails(accountKey): Promise<any> {
        return await this.accountDetailsRepository.findOne({accountKey: accountKey});
    }

    async doctor_Details(doctorId): Promise<any> {
        return await this.doctorRepository.findOne({doctor_id: doctorId});
    }


    async doctor_List(accountKey): Promise<any> {
        return await this.doctorRepository.find({accountKey: accountKey});
    }

    async doctorListAccount(accountKey): Promise<any> {
        let docConfig = await this.docConfigScheduleDayRepository.query(queries.getDocListDetails, [accountKey]);
        return docConfig;
    }

    async doctorPreconsultation(doctorConfigPreConsultationDto: DoctorConfigPreConsultationDto): Promise<any> {
        return await this.doctorConfigPreConsultationRepository.doctorPreconsultation(doctorConfigPreConsultationDto);
    }

    async doctorCanReschEdit(doctorConfigCanReschDto: DoctorConfigCanReschDto): Promise<any> {
        return await this.doctorConfigCanReschRepository.doctorCanReschEdit(doctorConfigCanReschDto);
    }

    async doctorCanReschView(doctorKey): Promise<any> {
        return await this.doctorConfigCanReschRepository.findOne({doctorKey: doctorKey});
    }

    // get details from docConfig table
    async getDoctorConfigDetails(doctorKey): Promise<any> {
        return await this.doctorConfigRepository.findOne({doctorKey: doctorKey});
    }

    async doctorConfigUpdate(doctorConfigDto: DocConfigDto): Promise<any> {
        // update the doctorConfig details
        if (!doctorConfigDto.doctorKey) {
            return {
                statusCode: HttpStatus.NO_CONTENT,
                message: 'Invalid Request'
            }
        }
        var condition = {
            doctorKey: doctorConfigDto.doctorKey
        }
        var values: any = doctorConfigDto;
        var updateDoctorConfig = await this.doctorConfigRepository.update(condition, values);
        if (updateDoctorConfig.affected) {
            return {
                statusCode: HttpStatus.OK,
                message: 'Updated Successfully'
            }
        } else {
            return {
                statusCode: HttpStatus.NOT_MODIFIED,
                message: 'Updation Failed'
            }
        }
    }

    // async workScheduleEdit(workScheduleDto: any, doctorKey: any): Promise<any> {
    //     var values1: any = workScheduleDto;
    //     const day = await this.docConfigScheduleDayRepository.findOne({
    //         doctorKey: workScheduleDto.doctorKey,
    //         dayOfWeek: workScheduleDto.dayOfWeek
    //     });
    //     var ref = day.docConfigScheduleDayId;
    //     var condition1 = {
    //         docConfigScheduleDayId: ref
    //     }
    //     //var updateWorkSchedule = await this.docConfigScheduleIntervalRepository.update(condition1, values1);
    //
    // }


    // async workScheduleView(docId): Promise<any> {
    //     const day = await this.docConfigScheduleDayRepository.find({doctorId : docId});
    //     var workSched=[];

    //     day.forEach( async function (workSchedule) {
    //         var dayDetails = workSchedule.docConfigScheduleDayId;
    //         const interval = this.docConfigScheduleIntervalRepository.find({docConfigScheduleDayId:dayDetails});
    //         var res = {
    //             day: workSchedule,
    //             interval: interval
    //         }
    //         workSched.push(res);
    //     });
    //     return workSched;
    // }

    async workScheduleView(doctorId: number, docKey: string): Promise<any> {
        let docConfig = await this.docConfigScheduleDayRepository.query(queries.getWorkSchedule, [doctorId]);
        if (docConfig) {
            let monday = [], tuesday = [], wednesday = [], thursday = [], friday = [], saturday = [], sunday = [];
            // format the response
            docConfig.forEach(v => {
                if (v.day_of_week === 'Monday') {
                    monday.push(v);
                }
                if (v.day_of_week === 'Tuesday') {
                    tuesday.push(v);
                }
                if (v.day_of_week === 'Wednesday') {
                    wednesday.push(v);
                }
                if (v.day_of_week === 'Thursday') {
                    thursday.push(v);
                }
                if (v.day_of_week === 'Friday') {
                    friday.push(v);
                }
                if (v.day_of_week === 'Saturday') {
                    saturday.push(v);
                }
                if (v.day_of_week === 'Sunday') {
                    sunday.push(v);
                }
            })
            const config = await this.doctorConfigRepository.query(queries.getConfig, [docKey]);
            let responseData = {
                Monday: monday,
                Tuesday: tuesday,
                Wednesday: wednesday,
                Thursday: thursday,
                Friday: friday,
                Saturday: saturday,
                Sunday: sunday,
                ConfigDetails: config
            }
            return responseData;
        } else {
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Invalid request"
            }
        }
    }


    async workScheduleEdit(workScheduleDto: any): Promise<any> {
        let scheduleTimeIntervals = workScheduleDto.updateWorkSchedule;
        if (scheduleTimeIntervals.length) {
            for (let scheduleTimeInterval of scheduleTimeIntervals) {
                if (scheduleTimeInterval.scheduletimeid) {
                    if (scheduleTimeInterval.isDelete) {
                        // if delete, then delete the record
                        let scheduleTimeId = scheduleTimeInterval.scheduletimeid;
                        let scheduleDayId = scheduleTimeInterval.scheduledayid;
                        let deleteInterval = await this.deleteDoctorConfigScheduleInterval(scheduleTimeId, scheduleDayId);
                    } else {
                        // if scheduletimeid is there then need to update
                        let doctorKey = workScheduleDto.user.doctor_key;
                        let dayOfWeek = workScheduleDto.dayOfWeek;
                        let doctorScheduledDays = await this.getDoctorConfigSchedule(doctorKey, dayOfWeek);
                        if (doctorScheduledDays && doctorScheduledDays.length) {
                            // // validate with previous data
                            let starTime = scheduleTimeInterval.startTime;
                            let endTime = scheduleTimeInterval.endTime;
                            let doctorConfigScheduleIntervalId = scheduleTimeInterval.scheduletimeid;
                            let isOverLapping = await  this.findTimeOverlaping(doctorScheduledDays, scheduleTimeInterval);
                            if (isOverLapping) {
                                //return error message
                                return {
                                    statusCode: HttpStatus.NOT_FOUND,
                                    message: 'Time Overlapping with previous Time Interval'
                                }
                            } else {
                                // update old records
                                const updateRecord = await this.updateIntoDocConfigScheduleInterval(starTime, endTime, doctorConfigScheduleIntervalId);
                            }
                        } else {
                            // no records, so cant update
                            return {
                                statusCode: HttpStatus.NO_CONTENT,
                                message: 'Invalid Request'
                            }
                        }
                    }
                } else {
                    // if scheduletimeid is not there  then new insert new records then
                    // get the previous interval timing from db
                    let doctorKey = workScheduleDto.user.doctor_key;
                    let dayOfWeek = workScheduleDto.dayOfWeek;
                    let doctorScheduledDays = await this.getDoctorConfigSchedule(doctorKey, dayOfWeek);
                    if (doctorScheduledDays && doctorScheduledDays.length) {
                        // validate with previous data
                        let starTime = scheduleTimeInterval.startTime;
                        let endTime = scheduleTimeInterval.endTime;
                        let doctorConfigScheduleDayId = scheduleTimeInterval.scheduledayid;
                        let isOverLapping = await  this.findTimeOverlaping(doctorScheduledDays, scheduleTimeInterval);
                        if (isOverLapping) {
                            //return error message
                            return {
                                statusCode: HttpStatus.NOT_FOUND,
                                message: 'Time Overlapping with previous Time Interval'
                            }
                        } else {
                            // insert new records
                            const insertRecord = await this.insertIntoDocConfigScheduleInterval(starTime, endTime, doctorConfigScheduleDayId);
                        }
                    } else {
                        // no previous datas are there just insert
                        let starTime = scheduleTimeInterval.startTime;
                        let endTime = scheduleTimeInterval.endTime;
                        let doctorConfigScheduleDayId = scheduleTimeInterval.scheduledayid;
                        const insertRecord = await this.insertIntoDocConfigScheduleInterval(starTime, endTime, doctorConfigScheduleDayId);
                    }
                }
            }
            return {
                statusCode: HttpStatus.OK,
                message: 'Updated SuccessFully'
            }
        } else {
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Invalid Request data'
            }
        }
    }


    async getDoctorConfigSchedule(doctorKey: string, dayOfWeek: string): Promise<any> {
        return await this.docConfigScheduleDayRepository.query(queries.getDoctorScheduleInterval, [doctorKey, dayOfWeek]);
    }

    async deleteDoctorConfigScheduleInterval(scheduletimeid: number, scheduleDayId: number): Promise<any> {
        return await this.docConfigScheduleDayRepository.query(queries.deleteDocConfigScheduleInterval, [scheduletimeid, scheduleDayId]);
    }


    async insertIntoDocConfigScheduleInterval(startTime, endTime, doctorConfigScheduleDayId): Promise<any> {
        return await this.docConfigScheduleDayRepository.query(queries.insertIntoDocConfigScheduleInterval, [startTime, endTime, doctorConfigScheduleDayId])
    }

    async updateIntoDocConfigScheduleInterval(startTime, endTime, doctorConfigScheduleDayId): Promise<any> {
        return await this.docConfigScheduleDayRepository.query(queries  .updateIntoDocConfigScheduleInterval, [startTime, endTime, doctorConfigScheduleDayId]);
    }


    // async appointmentSlotsView(user: any): Promise<any> {
    //     return await this.appointmentRepository.find({});
    // }

    async appointmentSlotsView(user: any): Promise<any> {
        const doc = await this.doctorDetails(user.doctorKey);
        var docId = doc.doctor_id;
        const app = await this.appointmentRepository.find({doctorId: docId});
        var appo: any = app;
        for (var i = 0; i < appo.length; i++) {
            if (appo[i].isCancel == false && appo[i].isActive == true) {
                const patId = appo[i].patientId;
                const pat = await this.patientDetailsRepository.findOne({id: patId});
                appo[i].patientDetails = pat;
                const pay = await this.paymentDetailsRepository.findOne({appointmentId: appo[i].id});
                appo[i].paymentDetails = pay;
            }
        }
        return appo;
    }

    async appointmentReschedule(appointmentDto: any): Promise<any> {

        if (!appointmentDto.appointmentId) {
            return {
                statusCode: HttpStatus.NO_CONTENT,
                message: 'Invalid Request'
            }
        }
        var condition = {
            id: appointmentDto.appointmentId
        }
        var values: any = {
            isCancel: true,
            cancelledBy: appointmentDto.user.role,
            cancelledId: appointmentDto.user.userId
        }
        var pastAppointment = await this.appointmentRepository.update(condition, values);
        //  return await this.appointmentRepository.appointmentReschedule(appointmentDto);
        return await this.appointmentRepository.createAppointment(appointmentDto)
    }

    async appointmentDetails(id: any): Promise<any> {
        return await this.appointmentRepository.findOne({id: id});
    }

    async appointmentCancel(appointmentDto: any): Promise<any> {

        if (!appointmentDto.appointmentId) {
            return {
                statusCode: HttpStatus.NO_CONTENT,
                message: 'Invalid Request'
            }
        }
        var condition = {
            id: appointmentDto.appointmentId
        }
        var values: any = {
            isCancel: true,
            cancelledBy: appointmentDto.user.role,
            cancelledId: appointmentDto.user.userId
        }
        var pastAppointment = await this.appointmentRepository.update(condition, values);
        if (pastAppointment.affected) {
            return {
                statusCode: HttpStatus.OK,
                message: 'Appointment Cancelled Successfully'
            }
        } else {
            return {
                statusCode: HttpStatus.NOT_MODIFIED,
                message: 'Updation Failed'
            }
        }

    }


    async patientSearch(patientDto: any): Promise<any> {
        return await this.patientDetailsRepository.findOne({phoneNumber: patientDto.phoneNumber});
    }


    // common functions below===============================================================

    async findTimeOverlaping(doctorScheduledDays, scheduleTimeInterval): Promise<any> {
        // validate with previous data
        let starTime = scheduleTimeInterval.startTime;
        let endTime = scheduleTimeInterval.endTime;
        let isOverLapping = false;
        // convert starttime into milliseconds
        let startTimeMilliSeconds = Helper.getTimeInMilliSeconds(starTime);
        let endTimeMilliSeconds = Helper.getTimeInMilliSeconds(endTime);
        // compare the startTime in any previous records, if start time or endTime comes between previous time interval
        doctorScheduledDays.forEach(v => {
            let vstartTimeMilliSeconds = Helper.getTimeInMilliSeconds(v.start_time);
            let vEndTimeMilliSeconds = Helper.getTimeInMilliSeconds(v.end_time);
            if (startTimeMilliSeconds >= vstartTimeMilliSeconds && startTimeMilliSeconds < vEndTimeMilliSeconds) {
                isOverLapping = true;
            } else if (endTimeMilliSeconds <= vEndTimeMilliSeconds && endTimeMilliSeconds > vstartTimeMilliSeconds) {
                isOverLapping = true;
            } else if (startTimeMilliSeconds === vstartTimeMilliSeconds && endTimeMilliSeconds === vEndTimeMilliSeconds) {
                isOverLapping = true;
            }
        })
        return isOverLapping;
    }


}
