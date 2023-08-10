import { IsArray, IsBase64, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, Validate, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

enum TypeDocumentDemande {
  ID = 'ID',
  NP = 'NP',
  VP = 'VP',
  RC = 'RC',
}

enum CodeDemande {
  PR = 'PR',
  RP = 'RP',
  RN = 'RN',
}

enum Raison {
  NV = 'Nouvelle',
  PT = 'Perte',
  EX = 'Expiration',
  ST = 'Saturation',
  DT = 'Détérioration',
}

enum LivraisonType {
  CAC = 'CAC',
  LAD = 'LAD', 
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

class LivraisonDetailsDTO {
  @ApiProperty({ enum: LivraisonType, enumName: 'LivraisonType' })
  @IsEnum(LivraisonType)
  livraisonType: LivraisonType;

  @ApiProperty()
  @IsString()
  codeCac?: string;

  @ApiProperty({ type: Location })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Location)
  Location?: Location;

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

export class DemandeTitreDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  uid: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  deviceToken: string;

  @ApiProperty({ enum: TypeDocumentDemande, enumName: 'TypeDocumentDemande' })
  @IsEnum(TypeDocumentDemande)
  typeDocumentDemande: TypeDocumentDemande;

  @ApiProperty({ enum: CodeDemande, enumName: 'CodeDemande' })
  @IsEnum(CodeDemande)
  codeDemande: CodeDemande;

  @ApiProperty({ enum: Raison, enumName: 'Raison' })
  @IsEnum(Raison)
  raison: Raison;

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  @IsBase64({ each: true })
  preuve: string[];

  @ApiProperty()
  @IsNotEmpty()
  @IsBase64()
  photoIcao: string;

  @ApiProperty({ type: LivraisonDetailsDTO })
  @IsObject()
  @ValidateNested()
  @Type(() => LivraisonDetailsDTO)
  livraisonDetails: LivraisonDetailsDTO;

  @ApiProperty({ type: Location })
  @IsObject()
  @ValidateNested()
  @Type(() => Location)
  position: Location;

  @ApiProperty()
  @IsString()
  nni: string;
}
