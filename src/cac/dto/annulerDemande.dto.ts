import { IsNotEmpty,  IsString  } from 'class-validator';




export class AnnulerDemandeDTO {
  @IsNotEmpty()
  @IsString()
  uid: string;

  @IsNotEmpty()
  @IsString()
  deviceToken: string;
  
  @IsNotEmpty()
  @IsString()
  nud: string;

 
}
