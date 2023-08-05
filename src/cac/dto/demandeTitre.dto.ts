import { IsArray, IsBase64, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, Validate, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

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
  @IsNotEmpty()
  @IsString()
  uid: string;

  @IsNotEmpty()
  @IsString()
  deviceToken: string;

  @IsEnum(TypeDocumentDemande)
  typeDocumentDemande: TypeDocumentDemande;

  @IsEnum(CodeDemande)
  codeDemande: CodeDemande;

  @IsEnum(Raison)
  raison: Raison;

  @IsArray()
  @IsNotEmpty()
  @IsBase64({ each: true })
  preuve: string[];

  @IsNotEmpty()
  @IsBase64()
  photoIcao: string;

  @IsObject()
  @ValidateNested()
  livraisonDetails: LivraisonDetailsDTO;

  @IsObject()
  @ValidateNested()
  position: Location;

  @IsString()
  nni: string;
}
