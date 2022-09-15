import {IsLatitude, IsLongitude, IsNotEmpty, IsNumber, IsString, IsUrl } from 'class-validator';

export class SupermarketDto {

    @IsNotEmpty()
    @IsString()
    name: string;
    
    @IsLongitude()
    lng: number;
  
    @IsLatitude()
    lat: number;

    @IsUrl()
    url: string;

}