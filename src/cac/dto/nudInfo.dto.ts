import { IsNotEmpty, IsString, IsDate, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NudInfoDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  nud: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  nni: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  date_creation: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  demandeStatus: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  commentaire: string;

  constructor(nud: string, nni: string, date_creation: Date, demandeStatus: number, commentaire: string) {
    this.nud = nud;
    this.nni = nni;
    this.date_creation = date_creation;
    this.demandeStatus = demandeStatus;
    this.commentaire = commentaire;
  }
}
