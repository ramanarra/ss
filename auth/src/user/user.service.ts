import {Injectable, HttpStatus, UnauthorizedException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {UserRepository} from './user.repository';
import {UserDto,PatientDto,DoctorDto,CONSTANT_MSG, queries, Email, Sms} from 'common-dto';
import {JwtPayLoad} from 'src/common/jwt/jwt-payload.interface';
import {JwtPatientLoad} from 'src/common/jwt/jwt-patientload.interface';
import {JwtService} from '@nestjs/jwt';
import {AccountRepository} from './account.repository';
import {RolesRepository} from './roles.repository';
import {RolePermissionRepository} from "./rolesPermission/role_permissions.repository";
import {PermissionRepository} from "./permissions/permission.repository";
//import {queries} from "../config/query";
import {UserRoleRepository} from './user_role.repository';
import {PatientRepository} from './patient.repository';
import * as bcrypt from "bcrypt";
var generator = require('generate-password');
import * as config from 'config';
const textLocal = config.get('textLocal');

@Injectable()
export class UserService {

    email: Email;
    sms: Sms;
    constructor(
        @InjectRepository(UserRepository) private userRepository: UserRepository, private accountRepository: AccountRepository,
        private rolesRepository: RolesRepository, private rolePersmissionRepository: RolePermissionRepository,
        private permissionRepository: PermissionRepository,private userRoleRepository: UserRoleRepository,
        private patientRepository: PatientRepository,
        private readonly jwtService: JwtService
    ) {
    }

    async signUp(userDto: UserDto): Promise<any> {
        return await this.userRepository.signUP(userDto);
    }


    async validateEmailPassword(userDto: UserDto): Promise<any> {
        const user = await this.userRepository.validateEmailPassword(userDto);
        if (!user)
            throw new UnauthorizedException("Invalid Credentials");

        const jwtUserInfo: JwtPayLoad = {email: user.email, userId: user.id, account_key: '', doctor_key: '', role: '', permissions : [],accountName:" "};
        const accessToken = this.jwtService.sign(jwtUserInfo);
        user.accessToken = accessToken;
        return user;
    }

    async findByEmail(email: string): Promise<any> {
        return await this.userRepository.findOne({email : email});
    }

    async findByPhone(phone: string): Promise<any> {
        return await this.patientRepository.findOne({phone});
    }


    async doctor_Login(email, password): Promise<any> {
        try {
            const user = await this.userRepository.validateEmailAndPassword(email, password);
            console.log("user data  in user.service=>", user)
            if (user.message == CONSTANT_MSG.INVALID_CREDENTIALS){
                 // throw new UnauthorizedException("Invalid Credentials");
                 return{
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: CONSTANT_MSG.INVALID_CREDENTIALS
                }
            }
            var accountId = user.account_id;
            var accountData = await this.accountKey(accountId);
            user.account_key = accountData.account_key;
            var roleId = await this.roleId(user.id);
            var roles = await this.role(roleId.role_id);
            user.accountName = accountData.account_name

            if (!roles)
                throw  new UnauthorizedException('Content Not Available');
            var rolesPermission = await this.getRolesPermissionId(roleId.role_id);
            let permissionArray = [];
            rolesPermission.forEach(v=>{
                permissionArray.push(v.name);
            })
            const jwtUserInfo: JwtPayLoad = {
                email: user.email,
                userId: user.id,
                account_key: accountData.account_key,
                doctor_key: user.doctor_key,
                role: roles.roles,
                permissions: permissionArray,
                accountName: accountData.accountName
            };
            console.log("=======jwtUserInfo", jwtUserInfo)
            const accessToken = this.jwtService.sign(jwtUserInfo);
            user.accessToken = accessToken;
            user.rolesPermission = rolesPermission;
            user.role = roles.roles;
            return user;
        } catch (e) {
            console.log(e);
            return {
                statusCode: HttpStatus.NO_CONTENT,
                message: CONSTANT_MSG.DB_ERROR
            }
        }
         
    }


    async accountKey(accountId: number): Promise<any> {
        return await this.accountRepository.findOne({account_id: accountId});
    }

    async role(id: number): Promise<any> {
        return await this.rolesRepository.findOne({roles_id: id});
    }

    async roleId(userId: number): Promise<any> {
        return await this.userRoleRepository.findOne({user_id: userId});
    }

    async getRolesPermissionId(roleId: number): Promise<any> {
        const role = await this.rolePersmissionRepository.query(queries.getRolesPermission, [roleId]);
        return role;
    }

    async patientLogin(email, password): Promise<any> {
        try {
            const user = await this.patientRepository.validatePhoneAndPassword(email, password);
            if (!user){
               // throw new UnauthorizedException("Invalid Credentials");
                return{
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: CONSTANT_MSG.INVALID_CREDENTIALS
                }
            }
            if(user.message){
                return user
            }
            const jwtUserInfo: JwtPatientLoad = {
                phone: user.phone,
                patientId: user.patient_id,
                permission: 'CUSTOMER',
                role:CONSTANT_MSG.ROLES.PATIENT
            };
            console.log("=======jwtUserInfo", jwtUserInfo)
            const accessToken = this.jwtService.sign(jwtUserInfo);
            user.accessToken = accessToken;
            user.permission = 'CUSTOMER';
            user.role=CONSTANT_MSG.ROLES.PATIENT;
            return user;
        } catch (e) {
            console.log(e);
            return {
                statusCode: HttpStatus.NO_CONTENT,
                message: CONSTANT_MSG.DB_ERROR
            }
        }

    }


    async patientRegistration(patientDto: PatientDto): Promise<any> {
        try {
            const pat = await this.findByPhone(patientDto.phone);
            if(pat){
                if(pat.createdBy == CONSTANT_MSG.ROLES.DOCTOR  && pat.password == null){
                    const update = await this.patientRegistrationUpdate(patientDto);
                    return {
                        update: "updated password",
                        patientId:pat.patient_id
                    }
                } else{
                    return {
                        statusCode: HttpStatus.BAD_REQUEST,
                        message: CONSTANT_MSG.ALREADY_PRESENT
                    }
                }
            }
            
            const user = await this.patientRepository.patientRegistration(patientDto);
            const jwtUserInfo: JwtPatientLoad = {
                phone: user.phone,
                patientId: user.patient_id,
                permission: 'CUSTOMER',
                role:CONSTANT_MSG.ROLES.PATIENT
            };
            console.log("=======jwtUserInfo", jwtUserInfo)
            const accessToken = this.jwtService.sign(jwtUserInfo);
            user.accessToken = accessToken;
            user.permission = 'CUSTOMER';
            return user;
        } catch (e) {
	        console.log(e);
            return {
                statusCode: HttpStatus.NO_CONTENT,
                message: CONSTANT_MSG.DB_ERROR
            }
        }
    }


    async patientRegistrationUpdate(patientDto: PatientDto): Promise<any> {
        try {
            const { name, phone, password} = patientDto;
            const salt = await bcrypt.genSalt();       
            patientDto.password = await this.hashPassword(password, salt);
            patientDto.salt = salt            
            var condition = {
                phone: patientDto.phone
            }
            var values: any = patientDto;
            var updateDoctorConfig = await this.patientRepository.update(condition, values);
            if (updateDoctorConfig.affected) {
                return {
                    updated:patientDto.password,
                }
            } else {
                return {
                    statusCode: HttpStatus.NOT_MODIFIED,
                    message: CONSTANT_MSG.UPDATE_FAILED
                }
            }
        } catch (e) {
            console.log(e);
            return {
                statusCode: HttpStatus.NO_CONTENT,
                message: CONSTANT_MSG.DB_ERROR
            }
        }
    }

    private async hashPassword(password: string, salt : string): Promise<string> {
        return bcrypt.hash(password, salt);
    }

    async doctorsResetPassword(userDto: any): Promise<any> {
        const users =  await this.userRepository.findOne({email: userDto.email});
        if(users){
            if(users.passcode == userDto.passcode){
                const salt = await bcrypt.genSalt(); 
                users.salt = salt;
                users.password = await this.hashPassword(userDto.password, salt);
                users.passcode = null;
                try{
                    await this.userRepository.save(users);
                    return{
                        statusCode: HttpStatus.OK,
                        message: CONSTANT_MSG.PASSWORD_CHANGED
                    }

                } catch (e) {
                    console.log(e);
                    return {
                        statusCode: HttpStatus.NO_CONTENT,
                        message: CONSTANT_MSG.DB_ERROR
                    }
                }

            } else{
                return {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: CONSTANT_MSG.PASSCODE_NOT_MATCHED
                }
            }
        }else{
            return {
                statusCode: HttpStatus.NO_CONTENT,
                message: CONSTANT_MSG.DB_ERROR
            }
        }
    }

    async doctorForgotPassword(email: string): Promise<any> {
        try{
            const users =  await this.userRepository.findOne({email: email});
            if(users){
                const salt = !users.salt ? await bcrypt.genSalt() : users.salt; 
                users.salt = salt;
                const password = await this.genPassword(6);
                console.log(password);
                users.password = await this.hashPassword(password.toString(), salt);
                let value: any = {
                    password: users.password, 
                    salt: users.salt
                };
                let condition = {
                    id: users.id
                }
                const updatePassword = await this.userRepository.update(condition, value);
                console.log(updatePassword);
                if(updatePassword.affected){
                    return {
                        statusCode: HttpStatus.OK,
                        message: CONSTANT_MSG.PASSWORD_UPDATION_SUCCESS,
                        password: password,
                        name: users.name
                    }
                } else {
                    return {
                        statusCode: HttpStatus.NO_CONTENT,
                        message: CONSTANT_MSG.PASSWORD_UPDATION_FAILED
                    }
                }
            } else {
                return {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: CONSTANT_MSG.INVALID_REQUEST
                }
            }
        } catch(err){
            console.log(err);
            return {
                statusCode: HttpStatus.NO_CONTENT,
                message: CONSTANT_MSG.DB_ERROR
            }
        }
    }

    async doctorRegistration(doctorDto: DoctorDto): Promise<any> {
        try {
            return await this.userRepository.doctorRegistration(doctorDto);
        } catch (e) {
	        console.log(e);
            return {
                statusCode: HttpStatus.NO_CONTENT,
                message: CONSTANT_MSG.DB_ERROR
            }
        }
    }

    async accountRegistration(account: any): Promise<any> {
        //return await this.accountRepository.findOne({account_id: accountId});
        const maxAccKey: any = await this.accountRepository.query(queries.getAccountKey)
        let accKey = 'Acc_';
        if (maxAccKey.length) {
            let m = maxAccKey[0]
            accKey = accKey + (Number(m.maxacc) + 1)
        } else {
            accKey = 'Acc_1'
        }
        account.accountKey = accKey;
        const uid: any = await this.userRepository.query(queries.getUser)
        let id = Number(uid[0].id) + 1;
        console.log(id);
        account.id = id;
        const accreg = await this.accountRepository.createAccount(account);
        return accreg;
    }

    async genPassword(length: number): Promise<any> {
        try {
            var password = generator.generate({
                length: length,
                numbers: true
            });
            return password
        } catch (e) {
	        console.log(e);
            return {
                statusCode: HttpStatus.NO_CONTENT,
                message: CONSTANT_MSG.DB_ERROR
            }
        }
    }
    async patientForgotPassword(patientDto: PatientDto): Promise<any> {
        try{
            const patient = await this.patientRepository.findOne({phone: patientDto.phone});
            if(patient && patient.patient_id){
                const salt = patient.salt ? patient.salt : await bcrypt.genSalt();
                const password = await this.genPassword(6);
                patient.password = await this.hashPassword(password.toString(), salt);
                const updatePassword = await this.patientRepository.update({patient_id: patient.patient_id}, {password: patient.password, salt: salt});
                console.log(updatePassword);
                if(updatePassword.affected){
                    // let data = {
                    //     apiKey: textLocal.APIKey,
                    //     message: "Your new password is " + password,
                    //     sender: textLocal.sender,
                    //     number: patientDto.phone,
                    // }

                    // const sendSMS = await this.sms.sendSms(data);
                    // if(sendSMS && sendSMS.statusCode === '200'){
                        return {
                            statusCode: HttpStatus.OK,
                            message: CONSTANT_MSG.PASSWORD_UPDATION_SUCCESS,
                            password: password
                        }
                    // }
                } 
                return {
                    statusCode: HttpStatus.NO_CONTENT,
                    message: CONSTANT_MSG.PASSWORD_UPDATION_FAILED
                }
            } else {
                return {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: CONSTANT_MSG.INVALID_REQUEST
                }
            }

        } catch (e) {
	        console.log(e);
            return {
                statusCode: HttpStatus.NO_CONTENT,
                message: CONSTANT_MSG.DB_ERROR
            }
        }
    }

    async patientResetPassword(patientDto: any): Promise<any> {
        const users =  await this.patientRepository.findOne({phone : patientDto.phone});
        if(users){
            if(users.passcode == patientDto.passcode){
                const salt = await bcrypt.genSalt(); 
                users.salt = salt;
                users.password = await this.hashPassword(patientDto.password, salt);
                users.passcode = null;
                try{
                    await this.patientRepository.save(users);
                    return{
                        statusCode: HttpStatus.OK,
                        message: CONSTANT_MSG.PASSWORD_CHANGED
                    }

                } catch (e) {
                    console.log(e);
                    return {
                        statusCode: HttpStatus.NO_CONTENT,
                        message: CONSTANT_MSG.DB_ERROR
                    }
                }

            } else{
                return {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: CONSTANT_MSG.PASSCODE_NOT_MATCHED
                }
            }
        }else{
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: CONSTANT_MSG.INVALID_REQUEST
            }
        }
    }

    async patientChangePassword(patientDto: any): Promise<any> {
        const users =  await this.patientRepository.findOne({phone : patientDto.phone});
        if(users && patientDto.user.patientId == users.patient_id){
            const salt = await bcrypt.genSalt();
            const pass = await this.hashPassword(patientDto.oldPassword, users.salt);
            if(users.password == pass){
                users.salt = salt;
                users.password = await this.hashPassword(patientDto.newPassword, salt);
                try{
                    await this.patientRepository.save(users);
                    return{
                        statusCode: HttpStatus.OK,
                        message: CONSTANT_MSG.PASSWORD_CHANGED
                    }
                } catch (e) {
                    console.log(e);
                    return {
                        statusCode: HttpStatus.NO_CONTENT,
                        message: CONSTANT_MSG.DB_ERROR
                    }
                }

            } else{
                return {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: CONSTANT_MSG.INVALID_PASSWORD
                }
            }
        }else{
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: CONSTANT_MSG.INVALID_REQUEST
            }
        }
    }

    async doctorChangePassword(patientDto: any): Promise<any> {
        const users =  await this.userRepository.findOne({email : patientDto.email});
        if(users && patientDto.user.email == users.email){
            const salt = await bcrypt.genSalt();
            const pass = await this.hashPassword(patientDto.oldPassword, users.salt);
            if(users.password == pass){
                users.salt = salt;
                users.password = await this.hashPassword(patientDto.newPassword, salt);
                try{
                    await this.userRepository.save(users);
                    return{
                        statusCode: HttpStatus.OK,
                        message: CONSTANT_MSG.PASSWORD_CHANGED
                    }
                } catch (e) {
                    console.log(e);
                    return {
                        statusCode: HttpStatus.NO_CONTENT,
                        message: CONSTANT_MSG.DB_ERROR
                    }
                }

            } else{
                return {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: CONSTANT_MSG.INVALID_PASSWORD
                }
            }
        }else{
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: CONSTANT_MSG.INVALID_REQUEST
            }
        }
    }
    
    async sendEmailWithTemplate(req: any): Promise<any> {
        const {email, template, subject, password, type, user_name} = req;

        var templateBody = template;
        if(type === CONSTANT_MSG.MAIL.FORGOT_PASSWORD){
            templateBody = templateBody.replace('{password}', password);
            templateBody = templateBody.replace('{user_name}', user_name ? user_name : '');
        }

        let params: any = {
            subject: subject,
            recipient: email,
            template: templateBody
        };

        try {
            let email = new Email();
            const sendMail = await email.sendEmail(params);
            console.log("mail response", sendMail);
            return {
                statusCode: HttpStatus.OK,
                message: CONSTANT_MSG.MAIL_OK
            }
        } catch (e) {
            console.log("error=> ", e);
            return {
                statusCode: HttpStatus.NO_CONTENT,
                message: CONSTANT_MSG.DB_ERROR
            }
        }

    }

    async getEmailTemplate(data: any): Promise<any> {
        try{


        } catch(err){
            console.log(err);
            return {
                statusCode: HttpStatus.NO_CONTENT,
                message: CONSTANT_MSG.DB_ERROR
            }
        }

    }

    async OTPVerification(patientDto: PatientDto): Promise<any> {
        try {

            const patient = await this.patientRepository.findOne({phone: patientDto.phone, passcode: patientDto.passcode});
            if(patient && patient.patient_id){
                return {
                    statusCode: HttpStatus.OK,
                    message: CONSTANT_MSG.OTP_VERIFICATION_SUCCESS
                }

            } else {
                return {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: CONSTANT_MSG.OTP_VERIFICATION_FAILED
                }
            }

        } catch(err){
            console.log(err);
            return {
                statusCode: HttpStatus.NO_CONTENT,
                message: CONSTANT_MSG.DB_ERROR
            }
        }

    }
}
