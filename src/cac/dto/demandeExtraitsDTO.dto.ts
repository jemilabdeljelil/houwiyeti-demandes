import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString, Validate, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

enum ExtraitType {
  EN = 'EN',
  EM = 'EM',
  EV = 'EV',
  ED = 'ED',
}

class Coordinates {
  @ApiProperty({ description: 'An array of two numbers: [longitude, latitude]' })
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
  @ApiProperty({ description: 'The type of location (e.g., Point)' })
  @IsNotEmpty()
  @IsString()
  type: 'Point';

  @ApiProperty({ type: Coordinates })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Coordinates)
  coordinates: Coordinates;
}

class Extrait {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  nni: string;

  @ApiProperty()
  @IsString()
  NumeroActe: string;

  @ApiProperty({ enum: ExtraitType, enumName: 'ExtraitType' })
  @IsNotEmpty()
  @IsString()
  extraitType: ExtraitType;

  @ApiProperty()
  @Type(() => Number)
  qtyAr: number;

  @ApiProperty()
  @Type(() => Number)
  qtyFr: number;
}

class LivraisonDetailsDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  livraisonType: string;

  @ApiProperty()
  @IsString()
  codeCac?: string;

  @ApiProperty({ type: Location })
  @IsObject()
  @ValidateNested()
  @Type(() => Location)
  Location: Location;

  @ApiProperty()
  @IsString()
  livraisonPhoneNumber: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  zipCode?: string;
}

export class DemandeExtraitsDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  uid: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  deviceToken: string;

  @ApiProperty({ type: Location })
  @IsNotEmpty()
  @IsObject()
  @Type(() => Location)
  location: Location;

  @ApiProperty({ type: Extrait, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Extrait)
  extraits: Extrait[];

  @ApiProperty({ type: LivraisonDetailsDTO })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  livraisonDetails: LivraisonDetailsDTO;
}
