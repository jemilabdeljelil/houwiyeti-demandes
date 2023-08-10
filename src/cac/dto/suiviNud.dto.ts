import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';



export class SuiviNudDTO {

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  uid: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  deviceToken: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  nud: string;


}
