import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';

import { CityEntity } from './city.entity';
import { CityService } from './city.service';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import validCountries from './valid-countries';

describe('CityService', () => {
  let service: CityService;
  let repository: Repository<CityEntity>;
  let citiesList: CityEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [CityService],
    }).compile();

    service = module.get<CityService>(CityService);
    repository = module.get<Repository<CityEntity>>(getRepositoryToken(CityEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    citiesList = [];
    for(let i = 0; i < 5; i++){
        const city: CityEntity = await repository.save({
        name: faker.address.cityName(),
        country: validCountries[Math.floor(Math.random() * validCountries.length)],
        population : parseInt(faker.random.numeric()),
        });
        citiesList.push(city)
   }
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all cities', async () => {
    const cities: CityEntity[] = await service.findAll();
    expect(cities).not.toBeNull();
    expect(cities).toHaveLength(citiesList.length);
  });

  it('findOne should return a city by id', async () => {
    const storedCity: CityEntity = citiesList[0];
    const city: CityEntity = await service.findOne(storedCity.id);
    expect(city).not.toBeNull();
    expect(city.name).toEqual(storedCity.name)
    expect(city.country).toEqual(storedCity.country)
    expect(city.population).toEqual(storedCity.population)
  });

  it('findOne should throw an exception for an invalid city', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "The city with the given id was not found")
  });

  it('create should return a new city', async () => {
    const city: CityEntity = {
      id: "",
      name: faker.address.cityName(),
      country: validCountries[Math.floor(Math.random() * validCountries.length)],
      population : parseInt(faker.random.numeric()),
      supermarkets: [],
    }

    const newCity: CityEntity = await service.create(city);

    expect(newCity).not.toBeNull();

    const storedCity: CityEntity = await repository.findOne({where: {id: newCity.id}})
    expect(storedCity).not.toBeNull();
    expect(storedCity.name).toEqual(newCity.name)
    expect(storedCity.country).toEqual(newCity.country)
    expect(storedCity.population).toEqual(newCity.population)
  });

  it('create should throw an exception for an invalid country name of a city', async () => {
    const city: CityEntity = {
      id: "",
      name: faker.address.cityName(),
      country: faker.random.alphaNumeric(10),
      population : parseInt(faker.random.numeric()),
      supermarkets: [],
    }

    await expect(() => service.create(city)).rejects.toHaveProperty("message", "The country name of the city is not valid")
  });

  it('update should modify a city', async () => {
    const city: CityEntity = citiesList[0];
    city.name = "New name";
    city.country = "Argentina";
    city.population = 0;
  
    const updatedCity: CityEntity = await service.update(city.id, city);
    expect(updatedCity).not.toBeNull();
  
    const storedCity: CityEntity = await repository.findOne({ where: { id: city.id } })
    expect(storedCity).not.toBeNull();
    expect(storedCity.name).toEqual(city.name)
    expect(storedCity.country).toEqual(city.country)
    expect(storedCity.population).toEqual(city.population)
  });

  it('update should throw an exception for an invalid city', async () => {
    const city: CityEntity = citiesList[0];
    city.id = ""
    city.name = "New name";
    city.country = "Argentina";
    city.population = 0;

    await expect(() => service.update(city.id, city)).rejects.toHaveProperty("message", "The city with the given id was not found")
  });

  it('update should throw an exception for an invalid country name of a city', async () => {
    const city: CityEntity = citiesList[0];
    city.name = "New name";
    city.country = "";
    city.population = 0;

    await expect(() => service.update(city.id, city)).rejects.toHaveProperty("message", "The country name of the city is not valid")
  });

  it('delete should remove a city', async () => {
    const city: CityEntity = citiesList[0];
    await service.delete(city.id);
  
    const deletedCity: CityEntity = await repository.findOne({ where: { id: city.id } })
    expect(deletedCity).toBeNull();
  });

  it('delete should throw an exception for an invalid city', async () => {
    await expect(() => service.delete("0")).rejects.toHaveProperty("message", "The city with the given id was not found")
  });

});
