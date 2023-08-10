import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegistreDemendResDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  numOrderDeRecette: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  Montant: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  demandeStatus: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  successCode: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  livresonPin: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  NUD: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  demandeId : string;

  // Constructor with seven arguments
  constructor(
    numOrderDeRecette: string,
    Montant: string,
    demandeStatus: number,
    successCode: number,
    livresonPin: string,
    NUD: string,
    demandeId: string
  ) {
    this.numOrderDeRecette = numOrderDeRecette;
    this.Montant = Montant;
    this.demandeStatus = demandeStatus;
    this.successCode = successCode;
    this.livresonPin = livresonPin;
    this.NUD = NUD;
    this.demandeId = demandeId;
  }
}
