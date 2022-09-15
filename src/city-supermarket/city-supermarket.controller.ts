import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { SupermarketDto } from 'src/supermarket/supermarket.dto';
import { SupermarketEntity } from 'src/supermarket/supermarket.entity';

import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { CitySupermarketService } from './city-supermarket.service';

@UseInterceptors(BusinessErrorsInterceptor)
@Controller('cities')
export class CitySupermarketController {
    
    constructor(private readonly citySupermarketService: CitySupermarketService){}

    @Post(':cityId/supermarkets/:supermarketId')
    async addSupermarketToCity(@Param('cityId') cityId: string, @Param('supermarketId') supermarketId: string){
        return await this.citySupermarketService.addSupermarketToCity(cityId, supermarketId);
    }

    @Get(':cityId/supermarkets/:supermarketId')
    async findSupermarketFromCity(@Param('cityId') cityId: string, @Param('supermarketId') supermarketId: string){
        return await this.citySupermarketService.findSupermarketFromCity(cityId, supermarketId);
    }

    @Get(':cityId/supermarkets')
    async findSupermarketsFromCity(@Param('cityId') cityId: string){
        return await this.citySupermarketService.findSupermarketsFromCity(cityId);
    }

    @Put(':cityId/supermarkets')
    async updateSupermarketsFromCity(@Body() supermarketDto: SupermarketDto[], @Param('cityId') cityId: string){
        return await this.citySupermarketService.updateSupermarketsFromCity(cityId, plainToInstance(SupermarketEntity, supermarketDto));
    }

    @Delete(':cityId/supermarkets/:supermarketId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteSupermarketFromCity(@Param('cityId') cityId: string, @Param('supermarketId') supermarketId: string){
        return await this.citySupermarketService.deleteSupermarketFromCity(cityId, supermarketId);
    }
}
