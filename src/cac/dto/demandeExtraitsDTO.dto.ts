import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString, Validate, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

enum ExtraitType {
  EN = 'EN',
  EM = 'EM',
  EV = 'EV',
  ED = 'ED',
}

class Coordinates {
  @IsArray()
  @IsNotEmpty()
  @Type(() => Number)
  @Validate((value: any) => {
    if (value.length !== 2 || isNaN(value[0]) || isNaN(value[1])) {
      return false;
    }
    return true;
  }, {
    message: 'Coordinates must be an array of two numbers: [longitude, latitude]'
  })
  coordinates: [number, number];
}

class Location {
  @IsNotEmpty()
  @IsString()
  type: 'Point';

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Coordinates)
  coordinates: Coordinates;
}

class Extrait {
  @IsNotEmpty()
  @IsString()
  nni: string;


  @IsString()
  NumeroActe: string;

  @IsNotEmpty()
  @IsString()
  extraitType: ExtraitType;


  @Type(() => Number)
  qtyAr: number;

 
  @Type(() => Number)
  qtyFr: number;
}

class LivraisonDetailsDTO {
  @IsNotEmpty()
  @IsString()
  livraisonType: string;

  @IsString()
  codeCac?: string;

  
  @IsObject()
  @ValidateNested()
  Location: Location;

  @IsString()
  livraisonPhoneNumber: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;
}

export class DemandeExtraitsDTO {
  @IsNotEmpty()
  @IsString()
  uid: string;

  @IsNotEmpty()
  @IsString()
  deviceToken: string;

  @IsNotEmpty()
  @IsObject()
  @Type(() => Location)
  location: Location;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Extrait)
  extraits: Extrait[];

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  livraisonDetails: LivraisonDetailsDTO;
}
