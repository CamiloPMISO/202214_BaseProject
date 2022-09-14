import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';

import { CityEntity } from '../city/city.entity';
import { CitySupermarketService } from './city-supermarket.service';
import { SupermarketEntity } from '../supermarket/supermarket.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import validCountries from '../city/valid-countries';

describe('CitySupermarketService', () => {
  let service: CitySupermarketService;
  let cityRepository: Repository<CityEntity>;
  let supermarketRepository: Repository<SupermarketEntity>;
  let supermarketList: SupermarketEntity[];
  let city: CityEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [CitySupermarketService],
    }).compile();

    service = module.get<CitySupermarketService>(CitySupermarketService);
    cityRepository = module.get<Repository<CityEntity>>(getRepositoryToken(CityEntity));
    supermarketRepository = module.get<Repository<SupermarketEntity>>(getRepositoryToken(SupermarketEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    cityRepository.clear();
    supermarketRepository.clear();
    supermarketList = [];
    for(let i = 0; i < 5; i++){
        const supermarket: SupermarketEntity = await supermarketRepository.save({
          name: faker.random.alpha(11),
          lng: parseInt(faker.address.longitude()),
          lat: parseInt(faker.address.latitude()),
          url : faker.internet.url(),
        });
        supermarketList.push(supermarket)
    }

    city = await cityRepository.save({
      name: faker.address.cityName(),
      country: validCountries[Math.floor(Math.random() * validCountries.length)],
      population : parseInt(faker.random.numeric()),
      supermarkets: supermarketList
    });
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addSupermarketToCity should add a supermarket to a city', async () => {
    
    const newCity : CityEntity = await cityRepository.save({
      name: faker.address.cityName(),
      country: validCountries[Math.floor(Math.random() * validCountries.length)],
      population : parseInt(faker.random.numeric())
    });

    const newSupermarket: SupermarketEntity = await supermarketRepository.save({
      name: faker.random.alpha(11),
      lng: parseInt(faker.address.longitude()),
      lat: parseInt(faker.address.latitude()),
      url : faker.internet.url(),
    });
 
    const result: CityEntity = await service.addSupermarketToCity(newCity.id, newSupermarket.id);
   
    expect(result.supermarkets.length).toBe(1);
    expect(result.supermarkets[0]).not.toBeNull();
    expect(result.supermarkets[0].name).toBe(newSupermarket.name);
  });

  it('addSupermarketToCity should thrown exception for an invalid supermarket', async () => {
    const newCity : CityEntity = await cityRepository.save({
      name: faker.address.cityName(),
      country: validCountries[Math.floor(Math.random() * validCountries.length)],
      population : parseInt(faker.random.numeric())
    });
 
    await expect(() => service.addSupermarketToCity(newCity.id, "0")).rejects.toHaveProperty("message", "The supermarket with the given id was not found");
  });

  it('addSupermarketToCity should thrown exception for an invalid city', async () => {
    const newSupermarket: SupermarketEntity = await supermarketRepository.save({
      name: faker.random.alpha(11),
      lng: parseInt(faker.address.longitude()),
      lat: parseInt(faker.address.latitude()),
      url : faker.internet.url(),
    });

    await expect(() => service.addSupermarketToCity("0", newSupermarket.id)).rejects.toHaveProperty("message", "The city with the given id was not found");
  });

  it('findSupermarketsFromCity should return supermarket of the city', async () => {
    const supermarket: SupermarketEntity = supermarketList[0];
    const storedSupermarket: SupermarketEntity = await service.findSupermarketFromCity(city.id, supermarket.id);

    expect(storedSupermarket).not.toBeNull();
    expect(storedSupermarket.name).toBe(supermarket.name);
  });

  it('findSupermarketsFromCity should throw an exception for an invalid supermarket', async () => {
    await expect(()=> service.findSupermarketFromCity(city.id, "0")).rejects.toHaveProperty("message", "The supermarket with the given id was not found");
  });

  it('findSupermarketsFromCity should throw an exception for an invalid city', async () => {
    const supermarket: SupermarketEntity = supermarketList[0];

    await expect(()=> service.findSupermarketFromCity("0", supermarket.id)).rejects.toHaveProperty("message", "The city with the given id was not found");
  });

  it('findSupermarketsFromCity should throw an exception for a supermarket not associated to the city', async () => {
    const newSupermarket: SupermarketEntity = await supermarketRepository.save({
      name: faker.random.alpha(11),
      lng: parseInt(faker.address.longitude()),
      lat: parseInt(faker.address.latitude()),
      url : faker.internet.url(),
    });
 
    await expect(
      ()=> service.findSupermarketFromCity(city.id, newSupermarket.id)
      ).rejects.toHaveProperty("message", "The supermarket with the given id is not associated to the city");
  });

  it('findSupermarketsFromCity should return supermarkets of a city', async ()=>{
    const supermarkets: SupermarketEntity[] = await service.findSupermarketsFromCity(city.id);
    expect(supermarkets.length).toBe(supermarketList.length)
  });

  it('findSupermarketsFromCity should throw an exception for an invalid city', async () => {
    await expect(()=> service.findSupermarketsFromCity("0")).rejects.toHaveProperty("message", "The city with the given id was not found");
  });

  it('updateSupermarketsFromCity should update supermarkets list for a city', async () => {
    const newSupermarket: SupermarketEntity = await supermarketRepository.save({
      name: faker.random.alpha(11),
      lng: parseInt(faker.address.longitude()),
      lat: parseInt(faker.address.latitude()),
      url : faker.internet.url(),
    });
 
    const updatedCity: CityEntity = await service.updateSupermarketsFromCity(city.id, [newSupermarket]);

    expect(updatedCity.supermarkets.length).toBe(1);
    expect(updatedCity.supermarkets[0].name).toBe(newSupermarket.name);
  });

  it('updateSupermarketsFromCity should throw an exception for an invalid city', async () => {
    const newSupermarket: SupermarketEntity = await supermarketRepository.save({
      name: faker.random.alpha(11),
      lng: parseInt(faker.address.longitude()),
      lat: parseInt(faker.address.latitude()),
      url : faker.internet.url(),
    });
 
    await expect(()=> service.updateSupermarketsFromCity("0", [newSupermarket])).rejects.toHaveProperty("message", "The city with the given id was not found");
  });

  it('updateSupermarketsFromCity should throw an exception for an invalid supermarket', async () => {
    const newSupermarket: SupermarketEntity = supermarketList[0];
    newSupermarket.id = "0";
 
    await expect(()=> service.updateSupermarketsFromCity(city.id, [newSupermarket])).rejects.toHaveProperty("message", "The supermarket with the given id was not found");
  });

  it('deleteSupermarketFromCity should remove a supermarket from a city', async () => {
    const supermarket : SupermarketEntity = supermarketList[0];
   
    await service.deleteSupermarketFromCity(city.id, supermarket.id);
 
    const storedCity: CityEntity = await cityRepository.findOne({where: {id: city.id}, relations: ["supermarkets"]});
    const deletedSupermarket: SupermarketEntity = storedCity.supermarkets.find(s => s.id === supermarket.id);
 
    expect(deletedSupermarket).toBeUndefined();
 
  });

  it('deleteSupermarketFromCity should throw an exception for an invalid supermarket', async () => {
    await expect(()=> service.deleteSupermarketFromCity(city.id, "0")).rejects.toHaveProperty("message", "The supermarket with the given id was not found");
  });

  it('deleteSupermarketFromCity should throw an exception for an invalid city', async () => {
    const supermarket : SupermarketEntity = supermarketList[0];

    await expect(()=> service.deleteSupermarketFromCity("0", supermarket.id)).rejects.toHaveProperty("message", "The city with the given id was not found");
  });

  it('deleteSupermarketFromCity should throw an exception for a supermarket not associated to the city', async () => {
    const newSupermarket: SupermarketEntity = await supermarketRepository.save({
      name: faker.random.alpha(11),
      lng: parseInt(faker.address.longitude()),
      lat: parseInt(faker.address.latitude()),
      url : faker.internet.url(),
    });
 
    await expect(
      ()=> service.deleteSupermarketFromCity(city.id, newSupermarket.id)
      ).rejects.toHaveProperty("message", "The supermarket with the given id is not associated to the city");
  });

});
