import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  ParseUUIDPipe,
  Param,
  NotFoundException,
  Patch,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { CreateClientProfileDto } from './dto/create-client.dto';
import { ClientsService } from './clients.service';
import { ClientProfile } from './entities/client.entity';

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  create(
    @Req() req: Request,
    @Body() createClientProfileDto: CreateClientProfileDto,
  ) {
    const userId = (req.user as any).user.id;

    return this.clientsService.createClientProfile(
      userId,
      createClientProfileDto,
    );
  }

  @Get()
  async getAllClientProfiles(
    @Req() req: Request,
  ): Promise<CreateClientProfileDto[]> {
    const userId = (req.user as any).user.id;
    const clientProfiles =
      await this.clientsService.getAllClientProfiles(userId);

    const clientProfileDtos = clientProfiles.map((profile) => ({
      id: profile.id,
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    }));

    return clientProfileDtos;
  }

  @Get(':id')
  async getClientById(
    @Param('id', new ParseUUIDPipe()) clientId: string,
  ): Promise<ClientProfile> {
    const client = await this.clientsService.getClientById(clientId);

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  @Patch(':id')
  async editClientProfile(
    @Param('id', new ParseUUIDPipe()) clientId: string,
    @Body() updateClientProfileDto: CreateClientProfileDto,
  ): Promise<ClientProfile> {
    const updatedClient = await this.clientsService.editClientProfile(
      clientId,
      updateClientProfileDto,
    );

    if (!updatedClient) {
      throw new NotFoundException('Client not found');
    }

    return updatedClient;
  }

  @Delete(':id')
  async deleteClientProfile(
    @Param('id', new ParseUUIDPipe()) clientId: string,
  ): Promise<void> {
    await this.clientsService.deleteClientProfile(clientId);

    return null;
  }
}
