import { IsNotEmpty,  IsString  } from 'class-validator';




export class SuiviNudDTO {
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
