import { Repository, EntityRepository } from "typeorm";
import {  Logger } from "@nestjs/common";
import {PatientDetails} from "./patientDetails.entity";
import { PatientDto} from  "common-dto";


@EntityRepository(PatientDetails)
export class PatientDetailsRepository extends Repository<PatientDetails> {

    private logger = new Logger('PatientDetailsRepository');

    async patientRegistration(patientDto: PatientDto): Promise<any> {

        const { name, patientId, email, phone, landmark, country, address, state, pincode, photo } = patientDto;

        const patient = new PatientDetails();
       // patient.doctorId = patientDto.doctorId;
        patient.patientId =patientDto.patientId ;
       // patient.appointmentDate =new Date(patientDto.appointmentDate);
        patient.name = patientDto.name;
        patient.landmark = patientDto.landmark;
        patient.country= patientDto.country;
        patient.address=patientDto.address;
        patient.state = patientDto.state;
        patient.pincode = patientDto.pincode;
        patient.email = patientDto.email;
        patient.photo = patientDto.photo;

        try {
            return await patient.save();          
        } catch (error) {
            if (error.code === "23505") {
                this.logger.warn(`Phone number already exists, Phone number is ${phone}`);
               // throw new ConflictException("Phone number already exists");
            } else {
                this.logger.error(`Unexpected Appointment save error` + error.message);
                //throw new InternalServerErrorException();
            }
        }
    }
    

}