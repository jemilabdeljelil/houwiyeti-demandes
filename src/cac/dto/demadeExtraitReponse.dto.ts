import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DemandeExtraitRepDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  numOrdreRecette: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  montant: string;

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

  constructor(numOrdreRecette: string, montant: string, demandeStatus: number, successCode: number, livresonPin: string) {
    this.numOrdreRecette = numOrdreRecette;
    this.montant = montant;
    this.demandeStatus = demandeStatus;
    this.successCode = successCode;
    this.livresonPin = livresonPin;
  }
}
