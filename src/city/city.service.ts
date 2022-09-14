import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { CityEntity } from './city.entity';
import validCountries from './valid-countries';

@Injectable()
export class CityService {
    constructor(
        @InjectRepository(CityEntity)
        private readonly cityRepository: Repository<CityEntity>
    ){}

    async findAll(): Promise<CityEntity[]> {
        return await this.cityRepository.find({relations: ['supermarkets']});
    }

    async findOne(id: string): Promise<CityEntity> {   
        return await this.findCity(id);
    }

    async create(city: CityEntity): Promise<CityEntity> {
        this.validCountry(city);
        return await this.cityRepository.save(city);
    }

    async update(id: string, city: CityEntity): Promise<CityEntity> {
        const persistedCity: CityEntity = await this.findCity(id);

        this.validCountry(city);
       
        Object.assign(persistedCity, city);
       
        return await this.cityRepository.save(persistedCity);
    }

    async delete(id: string) {
        const city: CityEntity = await this.findCity(id);
     
        await this.cityRepository.remove(city);
    }

    private async findCity(id: string) {
        const city: CityEntity = await this.cityRepository.findOne({ where: { id }, relations: ['supermarkets'] });
        if (!city)
            throw new BusinessLogicException("The city with the given id was not found", BusinessError.NOT_FOUND);
        return city;
    }

    private validCountry(city: CityEntity) {
        if (!validCountries.includes(city.country))
            throw new BusinessLogicException("The country name of the city is not valid", BusinessError.PRECONDITION_FAILED);
    }
}
