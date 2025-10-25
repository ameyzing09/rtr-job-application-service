import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './applications.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AdvanceApplicationResponseDto } from './dto/advance-application.dto';
import { RejectApplicationResponseDto } from './dto/reject-application.dto';
import {
  PublicStatusQueryDto,
  PublicStatusResponseDto,
} from './dto/public-status.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationService: ApplicationsService) {}

  @Post()
  async createApplication(
    @Body() createApplicationPayload: CreateApplicationDto,
    @Req() req: Request,
  ) {
    const tenantId = req['tenantId'] as string;
    const jwtToken = this.extractJwtToken(req);
    const requestId = req['requestId'] as string | undefined;
    return this.applicationService.createApplication(
      tenantId,
      createApplicationPayload,
      jwtToken,
      requestId,
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

  @Post(':applicationId/advance')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'HR')
  async advanceApplication(
    @Param('applicationId') applicationId: string,
    @Req() req: Request,
  ): Promise<AdvanceApplicationResponseDto> {
    const tenantId = req['tenantId'] as string;
    const jwtToken = this.extractJwtToken(req);
    const requestId = req['requestId'] as string | undefined;
    return this.applicationService.advanceApplication(
      tenantId,
      applicationId,
      jwtToken,
      requestId,
    );
  }

  @Post(':applicationId/reject')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'HR')
  async rejectApplication(
    @Param('applicationId') applicationId: string,
    @Req() req: Request,
  ): Promise<RejectApplicationResponseDto> {
    const tenantId = req['tenantId'] as string;
    return this.applicationService.rejectApplication(tenantId, applicationId);
  }

  @Get('status')
  async getPublicStatus(
    @Query() query: PublicStatusQueryDto,
  ): Promise<PublicStatusResponseDto> {
    return this.applicationService.getPublicStatus(query.token);
  }

  /**
   * Extract JWT token from Authorization header
   */
  private extractJwtToken(req: Request): string {
    const authHeader = req.headers['authorization'] as string;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return '';
    }
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }
}
