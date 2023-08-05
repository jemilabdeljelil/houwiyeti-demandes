import { IsNotEmpty,  IsString  } from 'class-validator';




export class CheckDemandeDTO {
  @IsNotEmpty()
  @IsString()
  uid: string;

  @IsNotEmpty()
  @IsString()
  deviceToken: string;
  //iv.	numOrdreRecette
  @IsNotEmpty()
  @IsString()
  numOrdreRecette: string;

 
}
