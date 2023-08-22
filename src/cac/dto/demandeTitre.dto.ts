import { IsArray, IsBase64, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, Validate, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

enum TypeDocumentDemande {
  ID = 'ID',//Carte d’identité
  NP = 'NP',//Passport normal
  VP = 'VP',//Passport VIP
  RC = 'RC',//Carte résident
}

enum CodeDemande {
  PR = 'PR',//Première demande 1
  RP = 'RP',//Remplacement  2
  RN = 'RN',//Renouvellement  3
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
  LAD = 'LAD',  //Livraison à domicile
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

class LivraisonDetailsDTO {
  @IsEnum(LivraisonType)
  livraisonType: LivraisonType;

  @IsString()
  codeCac?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  Location?: Location;


  @IsString()
  livraisonPhoneNumber: string;

  @IsOptional()
  @IsString()
  address?: string;

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
  
  @ApiProperty()
  @IsEnum(TypeDocumentDemande)
  typeDocumentDemande: TypeDocumentDemande;

  @ApiProperty()
  @IsEnum(CodeDemande)
  codeDemande: CodeDemande;

  @ApiProperty()
  @IsEnum(Raison)
  raison: Raison;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsBase64({ each: true })
  preuve?: string[];

  @ApiProperty()
  @IsNotEmpty()
  @IsBase64()
  photoIcao: string;

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  livraisonDetails: LivraisonDetailsDTO;

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  position: Location;

  @ApiProperty()
  @IsString()
  nni: string;
}