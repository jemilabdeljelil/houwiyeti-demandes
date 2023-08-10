import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DemandeStatusRepDTO {
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
  commentaire: string;

  constructor(demandeStatus: number, successCode: number, commentaire: string) {
    this.demandeStatus = demandeStatus;
    this.successCode = successCode;
    this.commentaire = commentaire;
  }
}
