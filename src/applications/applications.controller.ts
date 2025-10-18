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
    const tenantId = req['tenantId'] as string;
    return this.applicationService.createApplication(
      tenantId,
      createApplicationPayload,
    );
  }

  @Get()
  async getApplications(@Req() req: Request) {
    const tenantId = req['tenantId'] as string;
    return this.applicationService.getApplications(tenantId);
  }

  @Get(':applicationId')
  async getApplicationById(
    @Param('applicationId') applicationId: string,
    @Req() req: Request,
  ) {
    const tenantId = req['tenantId'] as string;
    return this.applicationService.getApplicationById(tenantId, applicationId);
  }

  @Put(':applicationId')
  async updateApplication(
    @Param('applicationId') applicationId: string,
    @Body() updateApplicationPayload: CreateApplicationDto,
    @Req() req: Request,
  ) {
    const tenantId = req['tenantId'] as string;
    return this.applicationService.updateApplication(
      tenantId,
      applicationId,
      updateApplicationPayload,
    );
  }

  @Delete(':applicationId')
  async deleteApplication(
    @Param('applicationId') applicationId: string,
    @Req() req: Request,
  ) {
    const tenantId = req['tenantId'] as string;
    return this.applicationService.deleteApplication(tenantId, applicationId);
  }
}
