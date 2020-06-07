import { Controller, Logger, Get, UseGuards, Post,Query,Put,Param, UseFilters, Body, UsePipes, ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { CalendarService } from 'src/service/calendar.service';
import { ApiOkResponse, ApiUnauthorizedResponse, ApiBody, ApiBearerAuth, ApiCreatedResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/common/decorator/roles.decorator';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { UserDto, AppointmentDto , DoctorConfigPreConsultationDto} from 'common-dto';
import { AllExceptionsFilter } from 'src/common/filter/all-exceptions.filter';

@Controller('calendar')
@UsePipes(new ValidationPipe({ transform: true }))
@UseFilters(AllExceptionsFilter)
export class CalendarController {

    private logger = new Logger('CalendarController');

    constructor( private readonly calendarService : CalendarService){}

    // @Get('appointment')
    // @ApiOkResponse({ description: 'Appointment List' })
    //@ApiBearerAuth('JWT')
    // @UseGuards(AuthGuard())
    // @Roles('doctor', 'patient')
    // getAppointmentList(@GetUser() userInfo : UserDto) {
    //   return this.calendarService.appointmentList(userInfo);
    // }


    // @Post('appointment')
    // @ApiOkResponse({ description: 'Create Appointment' })
    // @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
    // @ApiBadRequestResponse({description:'Invalid Schema'})
    // @ApiBody({ type: AppointmentDto })
    // @ApiBearerAuth('JWT')
    // @UseGuards(AuthGuard())
    // @Roles('admin')
    // createAppointment(@GetUser() userInfo : UserDto, @Body() appointmentDto : AppointmentDto) {
    //   this.logger.log(`Appointment  Api -> Request data ${JSON.stringify(appointmentDto)}`);
    //   return this.calendarService.createAppointment(userInfo, appointmentDto);
    // }

    @Get('doctor_List')
    @ApiOkResponse({ description: 'Doctor List' })
    @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
    //@UseInterceptors(ClassSerializerInterceptor)
    doctorList(@Query('Role') role: string,@Query('Key') key: string) {
      this.logger.log(`Doctor List  Api -> Request data ${JSON.stringify(role)}`);
      return this.calendarService.doctorList(role,key);
    }


    @Post('doctorSettingsPersonalView')
    @ApiOkResponse({ description: 'Doctor View' })
    @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
    //@ApiBody({ type: DoctorDto })
    doctorView(@Query('Key') key: string) {
      this.logger.log(`Doctor View  Api -> Request data ${JSON.stringify(key)}`);
      return this.calendarService.doctorView(key);
    }

    @Post('doctorConfigCostAndPreconsultationUpdate')
    @ApiOkResponse({ description: 'Cost &  Preconsultation Update' })
    @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
    @ApiBody({ type: DoctorConfigPreConsultationDto })
    doctor_Login(@Body() doctorConfigPreConsultationDto : DoctorConfigPreConsultationDto) {
      this.logger.log(`Doctor Login  Api -> Request data ${JSON.stringify(doctorConfigPreConsultationDto)}`);
      return this.calendarService.doctorPreconsultation(doctorConfigPreConsultationDto);
    }



}
