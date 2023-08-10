import { IsNotEmpty,  IsString  } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';



export class CheckDemandeDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  uid: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  deviceToken: string;
  //iv.	numOrdreRecette

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  numOrdreRecette: string;

 
}
