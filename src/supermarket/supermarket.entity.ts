import { Column, Entity, ManyToMany, JoinTable, PrimaryGeneratedColumn } from "typeorm";

import { CityEntity } from "../city/city.entity";

@Entity()
export class SupermarketEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;
    
    @Column()
    lng: number;

    @Column()
    lat: number;

    @Column()
    url: string;

    @ManyToMany(() => CityEntity, cities => cities.supermarkets)
    @JoinTable()
    cities: CityEntity[];

} 
