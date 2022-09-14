import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { SupermarketEntity } from './supermarket.entity';

@Injectable()
export class SupermarketService {
    constructor(
        @InjectRepository(SupermarketEntity)
        private readonly supermarketRepository: Repository<SupermarketEntity>
    ){}

    async findAll(): Promise<SupermarketEntity[]> {
        return await this.supermarketRepository.find({relations: ['cities']});
    }

    async findOne(id: string): Promise<SupermarketEntity> {   
        return await this.findSupermarket(id);
    }

    async create(supermarket: SupermarketEntity): Promise<SupermarketEntity> {
        this.validSupermarket(supermarket);
        return await this.supermarketRepository.save(supermarket);
    }

    async update(id: string, supermarket: SupermarketEntity): Promise<SupermarketEntity> {
        const persistedSupermarket: SupermarketEntity = await this.findSupermarket(id);

        this.validSupermarket(supermarket);
       
        Object.assign(persistedSupermarket, supermarket);
       
        return await this.supermarketRepository.save(persistedSupermarket);
    }

    async delete(id: string) {
        const supermarket: SupermarketEntity = await this.findSupermarket(id);
     
        await this.supermarketRepository.remove(supermarket);
    }

    private async findSupermarket(id: string) {
        const supermarket: SupermarketEntity = await this.supermarketRepository.findOne({ where: { id }, relations: ['cities'] });
        if (!supermarket)
            throw new BusinessLogicException("The supermarket with the given id was not found", BusinessError.NOT_FOUND);
        return supermarket;
    }

    private validSupermarket(supermarket: SupermarketEntity) {
        if (supermarket.name.length <= 10)
            throw new BusinessLogicException("The supermarket lenght name is less than 10", BusinessError.PRECONDITION_FAILED);
    }
}
