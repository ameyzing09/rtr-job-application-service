import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './applications.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationService: ApplicationsService) {}

  @Post()
  async createApplication(
    @Body() createApplicationPayload: CreateApplicationDto,
    @Req() req: Request,
  ) {
    const tenant_id = req['tenant_id'] as string;
    return this.applicationService.createApplication(
      tenant_id,
      createApplicationPayload,
    );
  }

  @Get()
  async getApplications(@Req() req: Request) {
    const tenant_id = req['tenant_id'] as string;
    return this.applicationService.getApplications(tenant_id);
  }

  @Get(':applicationId')
  async getApplicationById(
    @Param('applicationId') applicationId: string,
    @Req() req: Request,
  ) {
    const tenant_id = req['tenant_id'] as string;
    return this.applicationService.getApplicationById(tenant_id, applicationId);
  }

  @Put(':applicationId')
  async updateApplication(
    @Param('applicationId') applicationId: string,
    @Body() updateApplicationPayload: CreateApplicationDto,
    @Req() req: Request,
  ) {
    const tenant_id = req['tenant_id'] as string;
    return this.applicationService.updateApplication(
      tenant_id,
      applicationId,
      updateApplicationPayload,
    );
  }

  @Delete(':applicationId')
  async deleteApplication(
    @Param('applicationId') applicationId: string,
    @Req() req: Request,
  ) {
    const tenant_id = req['tenant_id'] as string;
    return this.applicationService.deleteApplication(tenant_id, applicationId);
  }
}
